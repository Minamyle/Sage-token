"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    walletId: "",
    referralCode: "", // added referral code field
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.walletId
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Save to localStorage for demo
    localStorage.setItem(
      "user",
      JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        walletId: formData.walletId,
        tokenBalance: 0,
      })
    );
    localStorage.setItem("isLoggedIn", "true");

    if (formData.referralCode) {
      // Find referrer by referral code
      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
      const referrer = allUsers.find((u: any) => {
        const refCode = localStorage.getItem(`referralCode_${u.email}`);
        return refCode === formData.referralCode;
      });

      if (referrer) {
        const referralData = {
          referrerId: referrer.email,
          referrerEmail: referrer.email,
          referredEmail: formData.email,
          referredName: formData.fullName,
          status: "pending",
          rewardAmount: 100,
          timestamp: Date.now(),
        };

        const referralsStr = localStorage.getItem(
          `referrals_${referrer.email}`
        );
        const referrals = referralsStr ? JSON.parse(referralsStr) : [];
        referrals.push(referralData);
        localStorage.setItem(
          `referrals_${referrer.email}`,
          JSON.stringify(referrals)
        );
      }
    }

    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    allUsers.push({
      fullName: formData.fullName,
      email: formData.email,
      walletId: formData.walletId,
      tokenBalance: 0,
    });
    localStorage.setItem("allUsers", JSON.stringify(allUsers));

    window.location.href = "/dashboard";
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

          <h1 className="text-2xl font-bold mb-2 text-center">
            Create Account
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            Start mining and earning tokens
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

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
                Wallet ID
              </label>
              <Input
                type="text"
                name="walletId"
                value={formData.walletId}
                onChange={handleChange}
                placeholder="0x..."
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

            <div>
              <label className="text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Referral Code (Optional)
              </label>
              <Input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="Enter referral code if you have one"
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
              Create Account
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Login
            </Link>
          </p>
        </div>
      </Card>
    </main>
  );
}
