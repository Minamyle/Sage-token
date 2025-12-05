"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Zap } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 -z-10 opacity-10">
        <div
          style={{
            backgroundImage:
              "linear-gradient(rgba(100,255,150,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,255,150,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <Card className="w-full max-w-md border-border bg-card">
        <div className="p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            {/* <Zap className="w-8 h-8 text-accent" /> */}
             <img src="./sage.jpeg" alt="logo" className="w-8 h-8" />
            <span className="text-2xl font-bold">Sage Token</span>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center">Reset Password</h1>
          <p className="text-muted-foreground text-center mb-6">Enter your email to receive reset instructions</p>

          {submitted ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Check Your Email</h2>
              <p className="text-muted-foreground mb-6">We've sent password reset instructions to {email}</p>
              <Link href="/login">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-6">
                Send Reset Link
              </Button>
            </form>
          )}

          <p className="text-center text-muted-foreground text-sm mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Login
            </Link>
          </p>
        </div>
      </Card>
    </main>
  )
}
