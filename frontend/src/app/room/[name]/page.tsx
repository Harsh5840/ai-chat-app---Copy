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

type ChatMessage = {
  sender: 'user' | 'ai'
  content: string
  username?: string
  fileUrl?: string
  fileType?: string
  fileName?: string
}

type TypingUser = {
  username: string
  userId: number
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
  const userId = typeof window !== 'undefined' ? Number(window.localStorage.getItem('userId')) : null
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, typingUsers])

  // Load chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const roomName = name.startsWith('room-') ? name : `room-${name}`;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/history/${roomName}`)
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

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}`)
    const roomName = name.startsWith('room-') ? name : `room-${name}`;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', roomName }))
      console.log(`Joined room: ${roomName}`)
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      console.log('WebSocket received:', msg);
      
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
            { sender: 'ai', content: msg.aiMessage?.content || '[No reply]', username: 'Bot' },
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
    maxSize: 5242880, // 5MB
    multiple: false
  })

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || !socket || !userId) return

    const roomName = name.startsWith('room-') ? name : `room-${name}`;
    
    let content = input.trim()
    
    // Handle file upload
    if (selectedFile) {
      // In a real app, you'd upload to a server/S3 and get a URL
      // For now, we'll use a data URL for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const fileUrl = e.target?.result as string
          content = content ? `${content}\n\n![${selectedFile.name}](${fileUrl})` : `![${selectedFile.name}](${fileUrl})`
          
          const msg = {
            type: 'chat',
            content,
            userId,
            roomName,
          }
          
          setInput('')
          setSelectedFile(null)
          setLoadingBot(true)
          socket.send(JSON.stringify(msg))
        }
        reader.readAsDataURL(selectedFile)
        return
      } else {
        content = content ? `${content}\n\n📎 ${selectedFile.name}` : `📎 ${selectedFile.name}`
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
            <p className="text-xs text-gray-400 mt-1">AI-Powered Chat Room</p>
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
                  {/* Username label above message */}
                  {message.username && (
                    <div className={`text-xs font-bold mb-1 px-2 ${
                      message.sender === 'user' 
                        ? 'text-right text-cyan-400' 
                        : 'text-left text-purple-400'
                    }`}>
                      {message.username}
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
