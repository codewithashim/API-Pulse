"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "login" | "signup"
}

export function UserAuthForm({ type, className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (type === "signup") {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure your passwords match.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            password: formData.password,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to create account")
        }

        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        })

        // Log the user in
        await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        })

        router.push("/dashboard")
      } catch (error) {
        console.error("Signup error:", error)
        toast({
          title: "Signup failed",
          description: error instanceof Error ? error.message : "Please try again later.",
          variant: "destructive",
        })
      }
    } else {
      // Login
      try {
        const result = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        })

        if (result?.error) {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        toast({
          title: "Login successful",
          description: "Welcome back to API Pulse!",
        })

        router.push("/dashboard")
      } catch (error) {
        console.error("Login error:", error)
        toast({
          title: "Something went wrong",
          description: "Please try again later.",
          variant: "destructive",
        })
      }
    }

    setIsLoading(false)
  }

  return (
    <div className={className} {...props}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "signup" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input id="first-name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input id="last-name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {type === "signup" && (
            <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
          )}
        </div>

        {type === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading
            ? type === "login"
              ? "Logging in..."
              : "Creating account..."
            : type === "login"
              ? "Login"
              : "Create account"}
        </Button>
      </form>
    </div>
  )
}
