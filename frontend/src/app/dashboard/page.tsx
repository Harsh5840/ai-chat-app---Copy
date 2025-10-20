"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import axiosAuth from "@/lib/axiosAuth"
import CreateRoomModal from "@/components/create-room-modal"

interface Room {
  id: string;
  name: string;
  description?: string;
  assistantId: number;
  assistant: {
    id: number;
    name: string;
    description?: string;
    prompt: string;
    imageUrl?: string;
  };
}

export default function Dashboard() {
  const [greeting, setGreeting] = useState("")
  const [rooms, setRooms] = useState<Room[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) return "Good morning"
      else if (hour >= 12 && hour < 17) return "Good afternoon"
      else if (hour >= 17 && hour < 21) return "Good evening"
      else return "Good night"
    }
    setGreeting(getGreeting())
    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axiosAuth.get("/dashboard");
        setRooms(response.data);
        console.log("Fetched rooms:", response.data);
      } catch (error: any) {
        console.error("Error fetching rooms:",error);
        // Redirect to login if unauthorized
        if (error.response?.status === 401) {
          router.push("/login");
        }
      }
    };
    fetchRooms();
  }, [router]);

  const handleRoomCreated = () => {
    // Refetch rooms after creating a new one
    const fetchRooms = async () => {
      try {
        const response = await axiosAuth.get("/dashboard");
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:",error);
      }
    };
    fetchRooms();
  }

  // Get icon for assistant type
  const getAssistantIcon = (assistantName: string) => {
    const iconMap: { [key: string]: string } = {
      'DevGPT': '💻',
      'ChefGPT': '👨‍🍳',
      'DocGPT': '⚕️',
      'LawGPT': '⚖️',
      'LegalGPT': '⚖️',
      'FitGPT': '💪',
      'FinanceGPT': '💰',
      'MoneyGPT': '💰',
      'StoryGPT': '📚',
    }
    return iconMap[assistantName] || '🤖'
  }

  // Get gradient colors for assistant type
  const getAssistantGradient = (assistantName: string) => {
    const gradientMap: { [key: string]: string } = {
      'DevGPT': 'from-blue-600 to-cyan-500',
      'ChefGPT': 'from-orange-600 to-red-500',
      'DocGPT': 'from-green-600 to-emerald-500',
      'LawGPT': 'from-purple-600 to-indigo-500',
      'LegalGPT': 'from-purple-600 to-indigo-500',
      'FitGPT': 'from-red-600 to-pink-500',
      'FinanceGPT': 'from-yellow-600 to-amber-500',
      'MoneyGPT': 'from-yellow-600 to-amber-500',
      'StoryGPT': 'from-violet-600 to-purple-500',
    }
    return gradientMap[assistantName] || 'from-gray-600 to-slate-500'
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-sans">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 animate-pulse"></div>
      <div className="fixed inset-0 bg-gradient-to-tr from-pink-900/10 via-transparent to-green-900/10 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="fixed inset-0 bg-gradient-to-bl from-transparent via-indigo-900/10 to-red-900/10 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-16">
        <header className="pt-16 pb-6 text-center relative flex items-center justify-center">
          {/* Back button */}
          <button
            onClick={() => router.replace('/')}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-cyan-500/20 text-cyan-300 transition-all shadow focus:outline-none focus:ring-2 focus:ring-cyan-400 hover:scale-110 hover:shadow-cyan-400/50 hover:drop-shadow-lg hover:bg-cyan-900/60 hover:text-white z-50"
            aria-label="Back to main page"
            type="button"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg mb-2 animate-fade-in">{greeting}, <span className="text-cyan-400">User!</span></h1>
            <p className="mt-2 text-lg text-gray-300 max-w-2xl mx-auto animate-fade-in-slow">Welcome to your dashboard. Here you can select the GPT helper you want to use.</p>
            <div className="mt-6 mb-2 flex justify-center">
              <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full opacity-70"></div>
            </div>
          </div>
        </header>
        
        {/* Create Room Button */}
        <div className="flex justify-center mt-8 mb-4">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg hover:shadow-xl px-8 py-6 text-lg font-semibold rounded-xl"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Custom Room
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {rooms.map((room: Room, idx) => (
            <Card
              key={room.id}
              className={
                `flex h-full flex-col overflow-hidden bg-black/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/40 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl animate-fade-in-card hover:scale-105` +
                ` delay-${idx * 100}`
              }
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Icon/Image Header */}
              <div className={`aspect-video w-full overflow-hidden relative bg-gradient-to-br ${getAssistantGradient(room.assistant.name)} flex items-center justify-center`}>
                <div className="text-8xl animate-bounce-slow">
                  {getAssistantIcon(room.assistant.name)}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-semibold">{room.assistant.name}</span>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl font-bold truncate">{room.name}</CardTitle>
                <CardDescription className="text-gray-300 text-sm line-clamp-2">
                  {room.assistant.description || room.description || "Your AI assistant room"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/50 hover:from-cyan-400 hover:to-blue-400 hover:shadow-xl hover:shadow-cyan-400/60 font-semibold rounded-xl py-2 text-base transition-all"
                  onClick={() => router.push(`/room/${room.name}`)}
                >
                  Enter Room
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />
      
      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4,0,0.2,1) both;
        }
        .animate-fade-in-slow {
          animation: fade-in 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
        .animate-fade-in-card {
          animation: fade-in 0.9s cubic-bezier(0.4,0,0.2,1) both;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
