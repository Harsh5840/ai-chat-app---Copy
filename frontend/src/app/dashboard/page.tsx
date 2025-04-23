"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import axiosAuth from "@/lib/axiosAuth"

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
  const [rooms, setRooms] = useState<Room[]>([])   //important
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
        const response = await axiosAuth.get("/dashboard"); // token is auto attached
        setRooms(response.data);
        console.log("Fetched rooms:", response.data);
      } catch (error) {
        console.error("Error fetching rooms:",error);
      }
    };    
    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{greeting}, User!</h1>
        <p className="mt-2 text-muted-foreground">Welcome to your dashboard. Here you can select the GPT helper you want to use.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room: Room) => (
          <Card key={room.id} className="flex h-full flex-col overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <Image
                src={`/images/login.jpeg`} // make sure your image naming matches room names
                alt={room.name}
                width={400}
                height={200}
                className="h-full w-full object-cover transition-all hover:scale-105"
              />
            </div>
            <CardHeader>
              <CardTitle>{`${room.name}`}</CardTitle>
              <CardDescription>{room.description || "Your AI assistant room"}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" />
            <CardFooter>
              <Button className="w-full" onClick={() => router.push(`/room/${room.name}`)}>     
                {/* //important */}
                Enter {room.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
