'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Paperclip, Send, Image as ImageIcon } from "lucide-react"
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useDropzone } from 'react-dropzone'
import ToastNotification, { showToast } from '@/components/toast-notification'

type ChatMessage = {
  sender: 'user' | 'ai'
  content: string
  username?: string
  fileUrl?: string
  fileType?: string
  fileName?: string
  aiName?: string
  aiIcon?: string
}

type TypingUser = {
  username: string
  userId: number
}

type Assistant = {
  id: number
  name: string
  description: string
  imageUrl?: string
}

const getAssistantIcon = (name: string) => {
  const icons: { [key: string]: string } = {
    'DevGPT': '💻',
    'ChefGPT': '👨‍🍳',
    'DocGPT': '⚕️',
    'LawGPT': '⚖️',
    'FitGPT': '💪',
    'FinanceGPT': '💰',
    'StoryGPT': '📚'
  }
  return icons[name] || '🤖'
}

export default function RoomPage() {
  const { name } = useParams() as { name: string }
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [input, setInput] = useState('')
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [loadingBot, setLoadingBot] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [roomAssistants, setRoomAssistants] = useState<Assistant[]>([])
  const userId = typeof window !== 'undefined' ? Number(window.localStorage.getItem('userId')) : null
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, typingUsers])

  // Load chat history and room info
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const API_HOST = (process.env.NEXT_PUBLIC_API_URL || 'https://ai-chat-app-copy-l7cx.onrender.com').replace(/\/$/, '')
        const roomName = name.startsWith('room-') ? name : `room-${name}`;
        const token = window.localStorage.getItem('token')
        
        // Fetch room details including assistants
        const roomRes = await fetch(`${API_HOST}/api/v1/room/${roomName}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const roomData = await roomRes.json()
        
        if (roomData.assistants) {
          setRoomAssistants(roomData.assistants)
        }
        
        // Fetch chat history
  const res = await fetch(`${API_HOST}/api/v1/chat/history/${roomName}`)
        const data = await res.json()
        if (data.history) setChat(data.history)
      } catch (err) {
        console.error('Failed to load history:', err)
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchHistory()
  }, [name])   


  // WebSocket connection
  useEffect(() => {
    if (!userId) return
    // Prefer explicit WS URL, otherwise construct from API host
    const rawApi = process.env.NEXT_PUBLIC_API_URL || 'https://ai-chat-app-copy-l7cx.onrender.com'
    const API_HOST_FOR_WS = rawApi.replace(/^http/, 'ws').replace(/\/$/, '')
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || API_HOST_FOR_WS

    if (!WS_URL) {
      console.warn('WebSocket URL not configured. WebSocket features will be disabled.')
      return
    }

    const ws = new WebSocket(WS_URL)
    const roomName = name.startsWith('room-') ? name : `room-${name}`;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', roomName, userId }))
      console.log(`Joined room: ${roomName}`)
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      console.log('WebSocket received:', msg);
      
      if (msg.type === 'user-joined') {
        // Show toast notification when a user joins
        if (msg.userId !== userId) {
          showToast(`${msg.username} joined the room`, 'info')
        }
      }
      
      if (msg.type === 'typing') {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== msg.userId)
          if (msg.isTyping) {
            return [...filtered, { username: msg.username, userId: msg.userId }]
          }
          return filtered
        })
      }
      
      if (msg.type === 'chat') {
        setChat((prev) => {
          const updated: ChatMessage[] = [
            ...prev,
            { sender: 'user', content: msg.userMessage.content, username: msg.userMessage.username },
            { 
              sender: 'ai', 
              content: msg.aiMessage?.content || '[No reply]', 
              username: 'Bot',
              aiName: msg.aiMessage?.aiName,
              aiIcon: msg.aiMessage?.aiIcon
            },
          ];
          console.log('Updated chat state:', updated);
          return updated;
        })
        setLoadingBot(false)
        // Clear typing indicator for this user
        setTypingUsers(prev => prev.filter(u => u.userId !== msg.userMessage.userId))
      }
      
      if (msg.type === 'error') {
        console.error('Chat error:', msg.message)
        setLoadingBot(false)
        showToast(msg.message, 'error')
        // Optionally show error to user
        setChat((prev) => [
          ...prev,
          { sender: 'ai', content: `⚠️ Error: ${msg.message}`, username: 'System' }
        ])
      }
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
      setLoadingBot(false)
    }

    ws.onclose = () => {
      console.log('Disconnected from WebSocket')
    }

    setSocket(ws)

    return () => ws.close()
  }, [name, userId])

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !userId) return
    
    const roomName = name.startsWith('room-') ? name : `room-${name}`;
    
    // Send typing start
    socket.send(JSON.stringify({
      type: 'typing',
      roomName,
      userId,
      isTyping: true
    }))
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set timeout to send typing stop
    typingTimeoutRef.current = setTimeout(() => {
      socket.send(JSON.stringify({
        type: 'typing',
        roomName,
        userId,
        isTyping: false
      }))
    }, 2000)
  }

  // File upload with dropzone
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md']
    },
    maxSize: 10485760, // 10MB
    multiple: false
  })

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || !socket || !userId) return

    const roomName = name.startsWith('room-') ? name : `room-${name}`;
    
    let content = input.trim()
    
    // Handle file upload to Cloudinary
    if (selectedFile) {
      try {
        setLoadingBot(true)
        
        // Upload to backend
        const formData = new FormData()
        formData.append('file', selectedFile)
        
        const token = window.localStorage.getItem('token')
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
        
        if (!uploadResponse.ok) {
          throw new Error('File upload failed')
        }
        
        const uploadData = await uploadResponse.json()
        const fileUrl = uploadData.url
        
        // Add file to message content as markdown
        if (selectedFile.type.startsWith('image/')) {
          content = content ? `${content}\n\n![${selectedFile.name}](${fileUrl})` : `![${selectedFile.name}](${fileUrl})`
        } else {
          content = content ? `${content}\n\n📎 [${selectedFile.name}](${fileUrl})` : `📎 [${selectedFile.name}](${fileUrl})`
        }
        
      } catch (error) {
        console.error('File upload error:', error)
        setLoadingBot(false)
        alert('Failed to upload file. Please try again.')
        return
      }
    }
    
    const msg = {
      type: 'chat',
      content,
      userId,
      roomName,
    }

    console.log('Sending message:', msg);
    setInput('')
    setSelectedFile(null)
    setLoadingBot(true)
    
    // Send typing stop
    socket.send(JSON.stringify({
      type: 'typing',
      roomName,
      userId,
      isTyping: false
    }))
    
    socket.send(JSON.stringify(msg))
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden font-sans">
      {/* Toast Notifications */}
      <ToastNotification />
      
      {/* Subtle animated background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
      </div>
      
      {/* Fixed header */}
      <header className="relative z-30 bg-gray-900/95 backdrop-blur-lg border-b border-cyan-500/20 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.replace('/dashboard')}
            className="p-2.5 rounded-xl bg-gray-800/80 border border-cyan-500/30 text-cyan-400 transition-all hover:scale-105 hover:bg-cyan-500/10 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-white">
              <span className="text-cyan-400">{name}</span>
            </h1>
            {roomAssistants.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                {roomAssistants.map((assistant) => (
                  <div
                    key={assistant.id}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-xs"
                  >
                    <span className="text-lg">{getAssistantIcon(assistant.name)}</span>
                    <span className="text-cyan-400 font-medium">{assistant.name}</span>
                  </div>
                ))}
              </div>
            )}
            {roomAssistants.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">AI-Powered Chat Room</p>
            )}
            {roomAssistants.length > 1 && (
              <p className="text-xs text-gray-400 mt-1">💡 Multi-AI Collaboration Active</p>
            )}
          </div>
          
          <div className="w-10"></div>
        </div>
      </header>

      {/* Chat messages area */}
      <div className="flex-1 overflow-hidden relative z-10">
        <div className="h-full overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar max-w-5xl mx-auto">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
                <p>Loading messages...</p>
              </div>
            </div>
          ) : chat.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <p className="text-lg mb-2">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            chat.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className="flex flex-col max-w-[75%] sm:max-w-[60%]">
                  {/* Username/AI label above message */}
                  {message.username && (
                    <div className={`text-xs font-bold mb-1 px-2 flex items-center gap-1 ${
                      message.sender === 'user' 
                        ? 'justify-end text-cyan-400' 
                        : 'justify-start text-purple-400'
                    }`}>
                      {message.sender === 'ai' && message.aiName && (
                        <span className="text-base">{getAssistantIcon(message.aiName)}</span>
                      )}
                      <span>{message.sender === 'ai' && message.aiName ? message.aiName : message.username}</span>
                    </div>
                  )}
                  
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-lg ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-sm'
                        : 'bg-gray-800/90 text-gray-100 border border-gray-700/50 rounded-bl-sm'
                    }`}
                  >
                    <div className={`prose prose-sm max-w-none ${
                      message.sender === 'user' ? 'prose-invert' : 'prose-invert'
                    }`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            const inline = !className
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus as any}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg my-2"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={`${className} bg-black/30 px-1.5 py-0.5 rounded text-sm`} {...props}>
                                {children}
                              </code>
                            )
                          },
                          img({ src, alt }: any) {
                            return (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={src} 
                                alt={alt || ''} 
                                className="rounded-lg my-2 max-w-full h-auto"
                              />
                            )
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-gray-800/90 border border-gray-700/50 rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                  <span className="text-sm text-gray-300">
                    {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {loadingBot && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-gray-800/90 border border-gray-700/50 rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                  <span className="text-sm text-gray-300">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="relative z-30 bg-gray-900/95 backdrop-blur-lg border-t border-cyan-500/20 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* File preview */}
          {selectedFile && (
            <div className="mb-3 flex items-center gap-2 bg-gray-800/50 border border-cyan-500/30 rounded-lg px-3 py-2">
              <ImageIcon className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-gray-300 flex-1">{selectedFile.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-red-400 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}
          
          {/* Drag and drop zone */}
          {isDragActive && (
            <div className="absolute inset-0 bg-cyan-500/10 border-2 border-dashed border-cyan-400 rounded-lg flex items-center justify-center z-50">
              <p className="text-cyan-400 font-semibold">Drop file here...</p>
            </div>
          )}
          
          <div className="flex gap-2 items-end">
            {/* File upload button */}
            <div {...getRootProps()} className="flex-shrink-0">
              <input {...getInputProps()} />
              <button
                className="p-3 rounded-xl bg-gray-800/80 border border-cyan-500/30 text-cyan-400 transition-all hover:bg-cyan-500/10 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
            
            {/* Text input */}
            <div className="flex-1">
              <Input
                placeholder="Type your message... (Markdown supported)"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  handleTyping()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                className="bg-gray-800/80 text-white border border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl px-4 py-3 min-h-[48px] resize-none"
                disabled={loadingBot}
              />
            </div>
            
            {/* Send button */}
            <Button
              onClick={sendMessage}
              disabled={(!input.trim() && !selectedFile) || loadingBot}
              className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line • Supports Markdown & code blocks
          </p>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .prose p {
          margin: 0.5em 0;
        }
        .prose ul, .prose ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        .prose pre {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  )
}
