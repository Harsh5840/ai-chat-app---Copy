'use client'
import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className=" bg-black relative overflow-hidden grid min-h-svh lg:grid-cols-2">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 animate-pulse"></div>
      <div className="fixed inset-0 bg-gradient-to-tr from-pink-900/10 via-transparent to-green-900/10 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="fixed inset-0 bg-gradient-to-bl from-transparent via-indigo-900/10 to-red-900/10 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="relative z-10 flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="text-white">HelpGPT Inc.</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/images/login.jpeg"
          fill
          priority
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
