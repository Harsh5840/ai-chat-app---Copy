'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let response;
      if (mode === 'register') {
        response = await axios.post("http://localhost:3000/api/v1/user/signup", {
          email: (document.getElementById("email") as HTMLInputElement)?.value,
          password: (document.getElementById("password") as HTMLInputElement)?.value,
          username: (document.getElementById("username") as HTMLInputElement)?.value,
        });
      } else {
        response = await axios.post("http://localhost:3000/api/v1/user/signin", {
          email: (document.getElementById("email") as HTMLInputElement)?.value,
          password: (document.getElementById("password") as HTMLInputElement)?.value,
        });
      }
      if (response.data && response.data.token) {
        if (response.data.userId) {
          window.localStorage.setItem("userId", response.data.userId);
        }
        window.localStorage.setItem("token", response.data.token);
        router.push("/dashboard");
      } else {
        setError("No token received from server");
      }
    } catch (error: any) {
      setError(error?.response?.data?.message || error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAuth} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{mode === 'login' ? 'Login to your account' : 'Create a new account'}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {mode === 'login' ? 'Enter your email and password to sign in.' : 'Fill in the details to sign up.'}
        </p>
      </div>
      <div className="grid gap-6">
        {mode === 'register' && (
          <div className="grid gap-3">
            <Label htmlFor="username" className="text-gray-200">Username</Label>
            <Input id="username" type="text" placeholder="Enter your username" required={mode === 'register'} />
          </div>
        )}
        <div className="grid gap-3">
          <Label htmlFor="email" className="text-gray-200">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password" className="text-gray-200">Password</Label>
          <Input id="password" type="password" placeholder="Enter your password" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (mode === 'login' ? 'Logging In...' : 'Signing Up...') : (mode === 'login' ? 'Log In' : 'Sign Up')}
        </Button>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      </div>
      <div className="text-center text-sm text-gray-300 mt-2">
        {mode === 'login' ? (
          <>Don&apos;t have an account?{' '}
            <button type="button" className="text-cyan-400 hover:underline" onClick={() => setMode('register')}>
              Sign up
            </button>
          </>
        ) : (
          <>Already have an account?{' '}
            <button type="button" className="text-cyan-400 hover:underline" onClick={() => setMode('login')}>
              Log in
            </button>
          </>
        )}
      </div>
    </form>
  );
}
