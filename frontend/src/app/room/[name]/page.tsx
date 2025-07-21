'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from "lucide-react"
import { useRouter } from 'next/navigation'

type ChatMessage = {
  sender: 'user' | 'ai'
  content: string
}

export default function RoomPage() {
  const { name } = useParams() as { name: string }
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [input, setInput] = useState('')
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [loadingBot, setLoadingBot] = useState(false)
  const userId = typeof window !== 'undefined' ? window.localStorage.getItem('userId') : null
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  // Load chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const roomName = name.startsWith('room-') ? name : `room-${name}`;
        const res = await fetch(`http://localhost:3000/api/v1/chat/history/${roomName}`)
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

    const ws = new WebSocket('ws://localhost:7070')
    const roomName = name.startsWith('room-') ? name : `room-${name}`;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', roomName }))
      console.log(`Joined room: ${roomName}`)
    }

    ws.onmessage = (event) => {   //when a message is received
      const msg = JSON.parse(event.data)
      console.log('WebSocket received:', msg);
      if (msg.type === 'chat') {
        setChat((prev) => {
          const updated = [
            ...prev,
            { sender: 'user', content: msg.userMessage },
            { sender: 'ai', content: msg.aiMessage?.content || '[No reply]' },
          ];
          console.log('Updated chat state:', updated);
          return updated;
        })
        setLoadingBot(false)
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

  const sendMessage = () => {
    if (!input.trim() || !socket || !userId) return

    const roomName = name.startsWith('room-') ? name : `room-${name}`;
    const msg = {
      type: 'chat',
      content: input,
      userId,
      roomName,
    }

    console.log('Sending message:', msg);
    setInput('')
    setLoadingBot(true)
    socket.send(JSON.stringify(msg))
  }

  return (
    <div className="flex flex-col min-h-screen bg-black relative overflow-hidden font-sans">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 animate-pulse"></div>
      <div className="fixed inset-0 bg-gradient-to-tr from-pink-900/10 via-transparent to-green-900/10 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="fixed inset-0 bg-gradient-to-bl from-transparent via-indigo-900/10 to-red-900/10 animate-pulse" style={{animationDelay: '2s'}}></div>
      {/* Fixed header at top */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-black/90 border-b border-cyan-500/10 text-center pt-8 pb-4 flex items-center justify-center" style={{backdropFilter: 'blur(8px)'}}>
        <a href="/dashboard" className="z-50">
          <button
            onClick={() => { console.log('Back button clicked'); router.replace('/dashboard'); }}
            className="z-50 absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-cyan-500/20 text-cyan-300 transition-all shadow focus:outline-none focus:ring-2 focus:ring-cyan-400 hover:scale-110 hover:shadow-cyan-400/50 hover:drop-shadow-lg hover:bg-cyan-900/60 hover:text-white"
            aria-label="Back to dashboard"
            type="button"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </a>
        <div className="w-full">
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg mb-1">Room: <span className="text-cyan-400">{name}</span></h1>
          <div className="h-1 w-20 mx-auto bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full opacity-70 mb-2"></div>
        </div>
      </header>
      {/* Scrollable chat area with top and bottom padding for header and input */}
      <div className="flex-1 flex flex-col overflow-hidden rounded-none bg-black/70 border-t border-cyan-500/20 shadow-xl backdrop-blur-md w-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" style={{ minHeight: 0, paddingTop: '112px', paddingBottom: '96px' }}>
          {loadingHistory ? (
            <div className="text-gray-400">Loading previous messages...</div>
          ) : (
            chat.map((message, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-lg break-words ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white self-end ml-auto shadow-lg'
                    : 'bg-black/60 text-cyan-100 border border-cyan-500/20 shadow'
                }`}
                style={{ alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start' }}
              >
                {message.content}
              </div>
            ))
          )}
          {loadingBot && (
            <div className="p-3 rounded-xl max-w-lg bg-gray-200 text-gray-600 animate-pulse">
              AI is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Fixed input at bottom of viewport */}
      <div className="fixed left-0 right-0 bottom-0 z-30 w-full bg-black/90 border-t border-cyan-500/10 px-2 sm:px-6 py-4 flex gap-2 items-center" style={{backdropFilter: 'blur(8px)'}}>
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 bg-black/80 text-white border border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg px-4 py-2"
        />
        <Button onClick={sendMessage} disabled={!input.trim() || loadingBot} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black border border-cyan-400/50 shadow-lg hover:from-cyan-400 hover:to-blue-400 font-semibold rounded-lg px-6 py-2">
          Send
        </Button>
      </div>
      {/* Custom scrollbar styling */}
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
      `}</style>
    </div>
  )
}
