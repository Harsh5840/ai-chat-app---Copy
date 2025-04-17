"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours()

      if (hour >= 5 && hour < 12) {
        return "Good morning"
      } else if (hour >= 12 && hour < 17) {
        return "Good afternoon"
      } else if (hour >= 17 && hour < 21) {
        return "Good evening"
      } else {
        return "Good night"
      }
    }

    setGreeting(getGreeting())

    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const cards = [
    {
      title: "Analytics Overview",
      description: "View your website traffic and conversion metrics at a glance.",
      buttonText: "View Analytics",
      imageAlt: "Analytics chart",
    },
    {
      title: "Recent Orders",
      description: "Check the status of recent customer orders and shipments.",
      buttonText: "Manage Orders",
      imageAlt: "Order list",
    },
    {
      title: "Inventory Status",
      description: "Monitor stock levels and get alerts for low inventory items.",
      buttonText: "Check Inventory",
      imageAlt: "Inventory items",
    },
    {
      title: "Customer Insights",
      description: "Analyze customer behavior and preferences to improve engagement.",
      buttonText: "View Insights",
      imageAlt: "Customer data",
    },
    {
      title: "Marketing Campaigns",
      description: "Track the performance of your current marketing initiatives.",
      buttonText: "View Campaigns",
      imageAlt: "Marketing graph",
    },
    {
      title: "System Settings",
      description: "Configure your dashboard preferences and notification settings.",
      buttonText: "Open Settings",
      imageAlt: "Settings interface",
    },
  ]

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{greeting}, User!</h1>
        <p className="mt-2 text-muted-foreground">Welcome to your dashboard. Here you can select the GPT helper you want to use.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <Card key={index} className="flex h-full flex-col overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
            
              <Image
                src={`/placeholder.svg?height=200&width=400`}
                alt={card.imageAlt}
                width={400}
                height={200}
                className="h-full w-full object-cover transition-all hover:scale-105"
              />
            </div>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">{/* Card content can be expanded here */}</CardContent>
            <CardFooter>
              <Button className="w-full">
                {card.buttonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
