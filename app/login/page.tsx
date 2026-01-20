"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Zap } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.login({
        email: formData.email,
        password: formData.password,
      });

      // Store user data
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("isLoggedIn", "true");

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

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

          <h1 className="text-2xl font-bold mb-2 text-center">Welcome Back</h1>
          <p className="text-muted-foreground text-center mb-6">
            Login to your mining account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-6"
            >
              Login
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <Link href="/forgot-password">
              <Button
                variant="ghost"
                className="w-full text-accent hover:bg-accent/10"
              >
                Forgot Password?
              </Button>
            </Link>
          </div>

          <p className="text-center text-muted-foreground text-sm mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </main>
  );
}
