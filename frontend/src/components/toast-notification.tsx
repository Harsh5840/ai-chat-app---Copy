'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

type Toast = {
  id: number
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

let toastId = 0
const toastCallbacks: ((toast: Toast) => void)[] = []

export const showToast = (message: string, type: Toast['type'] = 'info') => {
  const toast: Toast = {
    id: ++toastId,
    message,
    type
  }
  toastCallbacks.forEach(callback => callback(toast))
}

export default function ToastNotification() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const callback = (toast: Toast) => {
      setToasts(prev => [...prev, toast])
      
      // Auto remove after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 4000)
    }

    toastCallbacks.push(callback)

    return () => {
      const index = toastCallbacks.indexOf(callback)
      if (index > -1) {
        toastCallbacks.splice(index, 1)
      }
    }
  }, [])

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500'
      case 'error':
        return 'bg-red-600 border-red-500'
      case 'warning':
        return 'bg-yellow-600 border-yellow-500'
      default:
        return 'bg-blue-600 border-blue-500'
    }
  }

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      default:
        return 'ℹ'
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} border-2 rounded-lg px-4 py-3 shadow-xl flex items-center gap-3 animate-slide-in`}
        >
          <span className="text-2xl">{getToastIcon(toast.type)}</span>
          <p className="flex-1 text-white font-medium text-sm">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
