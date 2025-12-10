"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Zap, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Get admin password from localStorage, default to hardcoded
    const adminPassword =
      localStorage.getItem("adminPassword") || "SageAdmin2025!";

    if (password === adminPassword) {
      localStorage.setItem("adminAuthenticated", "true");
      router.push("/admin");
    } else {
      setError("Invalid admin password");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <Card className="border-border bg-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold">Sage Admin</span>
          </div>
          <p className="text-muted-foreground">
            Enter admin credentials to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Admin Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="bg-input border-border text-foreground"
              required
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Lock className="w-4 h-4 mr-2" />
            Access Admin Panel
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Authorized personnel only
          </p>
        </div>
      </Card>
    </main>
  );
}
