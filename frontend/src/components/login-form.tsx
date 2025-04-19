'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios"
import { useRouter } from "next/navigation"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const sendAuth = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form default submission
    try {  
      const response = await axios.post("http://localhost:3000/api/v1/user/signup", {
        email: (document.getElementById("email") as HTMLInputElement)?.value,
        password: (document.getElementById("password") as HTMLInputElement)?.value,
        username: (document.getElementById("username") as HTMLInputElement)?.value,     
      });
      
      if (response.data && response.data.token) {
        window.localStorage.setItem("token", response.data.token);
        console.log("Token stored:", response.data.token); // Debug log
        router.push("/dashboard");
      } else {
        console.error("No token received from server");
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  }

  return (
    <form onSubmit={sendAuth} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to sign in.
        </p>
      </div>
      <div className="grid gap-6">
      <div className="grid gap-3">
          <Label htmlFor="email">Username</Label>
          <Input id="username" type="text" placeholder="Enter your username" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input id="password" type="password" placeholder="Enter your password" required />
        </div>
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
          </div>        
    </form>
  )

}
