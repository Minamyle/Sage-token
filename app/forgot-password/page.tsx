"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  const [error, setError] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if user exists
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const user = allUsers.find((u: any) => u.email === email);

    if (!user) {
      setError("No account found with this email address");
      return;
    }

    setStep("reset");
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Update password in allUsers
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const updatedAllUsers = allUsers.map((u: any) =>
      u.email === email ? { ...u, password: newPassword } : u
    );
    localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));

    // Update password in user_profile if exists
    const userProfileStr = localStorage.getItem(`user_profile_${email}`);
    if (userProfileStr) {
      const userProfile = JSON.parse(userProfileStr);
      userProfile.password = newPassword;
      localStorage.setItem(
        `user_profile_${email}`,
        JSON.stringify(userProfile)
      );
    }

    // If user is currently logged in, update their session
    const currentUserStr = localStorage.getItem("user");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.email === email) {
        currentUser.password = newPassword;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    }

    setStep("success");
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

          {step === "email" && (
            <>
              <h1 className="text-2xl font-bold mb-2 text-center">
                Reset Password
              </h1>
              <p className="text-muted-foreground text-center mb-6">
                Enter your email to reset your password
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                {error && (
                  <p className="text-destructive text-sm text-center">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-6"
                >
                  Continue
                </Button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <h1 className="text-2xl font-bold mb-2 text-center">
                Set New Password
              </h1>
              <p className="text-muted-foreground text-center mb-6">
                Enter your new password for {email}
              </p>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="mt-2 bg-input border-border text-foreground"
                    required
                  />
                </div>

                {error && (
                  <p className="text-destructive text-sm text-center">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-6"
                >
                  Reset Password
                </Button>

                <Button
                  type="button"
                  onClick={() => setStep("email")}
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                Password Reset Successful
              </h2>
              <p className="text-muted-foreground mb-6">
                Your password has been successfully reset. You can now log in
                with your new password.
              </p>
              <Link href="/login">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Back to Login
                </Button>
              </Link>
            </div>
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
  );
}
