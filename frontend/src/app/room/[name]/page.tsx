'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type ChatMessage = {
  sender: 'user' | 'ai'
  content: string
}

export default function RoomPage() {
  const { name } = useParams() as { name: string }
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [input, setInput] = useState('')
  const [chat, setChat] = useState<ChatMessage[]>([])
  const userId = typeof window !== 'undefined' ? window.localStorage.getItem('userId') : null
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  useEffect(() => {
    if (!userId) return

    const ws = new WebSocket('ws://localhost:7070')

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', roomName: name }))
      console.log(`Joined room: ${name}`)
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      if (msg.type === 'chat') {
        setChat((prev) => [
          ...prev,
          { sender: 'user', content: msg.userMessage },
          { sender: 'ai', content: msg.aiMessage?.content || '[No reply]' },
        ])
      }
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    ws.onclose = () => {
      console.log('Disconnected from WebSocket')
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [name, userId])

  const sendMessage = () => {
    if (!input.trim() || !socket || !userId) return

    const msg = {
      type: 'chat',
      content: input,
      userId,
      roomName: name,
    }

    socket.send(JSON.stringify(msg))
    setInput('')
  }

  return (
    <div className="flex flex-col min-h-screen p-6 bg-background">
      <h1 className="text-2xl font-bold mb-4">Room: {name}</h1>
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {chat.map((message, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-lg ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white self-end ml-auto'
                : 'bg-gray-100 text-black'
            }`}
          >
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  )
}
