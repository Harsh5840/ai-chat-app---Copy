'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Sparkles } from 'lucide-react'
import axiosAuth from '@/lib/axiosAuth'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onRoomCreated: () => void
}

const botTypes = [
  { id: 'devgpt', name: 'DevGPT', description: 'Expert coding assistant', icon: '💻' },
  { id: 'chefgpt', name: 'ChefGPT', description: 'Culinary expert', icon: '👨‍🍳' },
  { id: 'docgpt', name: 'DocGPT', description: 'Medical information assistant', icon: '⚕️' },
  { id: 'lawgpt', name: 'LawGPT', description: 'Legal assistant', icon: '⚖️' },
  { id: 'fitgpt', name: 'FitGPT', description: 'Fitness and wellness coach', icon: '💪' },
  { id: 'moneygpt', name: 'MoneyGPT', description: 'Financial advisor', icon: '💰' },
  { id: 'storygpt', name: 'StoryGPT', description: 'Creative writing assistant', icon: '📚' },
]

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('')
  const [selectedBot, setSelectedBot] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!roomName.trim()) {
      setError('Please enter a room name')
      return
    }

    if (!selectedBot) {
      setError('Please select a bot type')
      return
    }

    setLoading(true)

    try {
      // Create room via API
      await axiosAuth.post('/room/create', {
        name: roomName.trim(),
        botType: selectedBot,
      })

      // Reset form and close modal
      setRoomName('')
      setSelectedBot('')
      onRoomCreated()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Create New Room</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="roomName" className="text-white text-sm font-medium">
              Room Name
            </Label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g., My Coding Space"
              className="bg-gray-800 border-gray-700 text-white focus:border-cyan-400 focus:ring-cyan-400"
              disabled={loading}
            />
          </div>

          {/* Bot Selection */}
          <div className="space-y-3">
            <Label className="text-white text-sm font-medium">Select AI Assistant</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {botTypes.map((bot) => (
                <button
                  key={bot.id}
                  type="button"
                  onClick={() => setSelectedBot(bot.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedBot === bot.id
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                  disabled={loading}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{bot.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{bot.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{bot.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
