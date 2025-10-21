'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    
    if (token && userId) {
      window.localStorage.setItem("token", token);
      window.localStorage.setItem("userId", userId);
      router.push("/dashboard");
    }
  }, [router]);

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let response;
      if (mode === 'register') {
        response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/signup`, {
          email: (document.getElementById("email") as HTMLInputElement)?.value,
          password: (document.getElementById("password") as HTMLInputElement)?.value,
          username: (document.getElementById("username") as HTMLInputElement)?.value,
        });
      } else {
        response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/signin`, {
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
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        setError((error as AxiosError<{ message?: string }>).response?.data?.message || 'Authentication failed');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Authentication failed');
      }
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
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2 text-gray-400">Or continue with</span>
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
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
