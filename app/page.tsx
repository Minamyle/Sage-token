"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Zap, X } from "lucide-react";

export default function LandingPage() {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Check if ads are enabled and show on launch
    const settingsStr = localStorage.getItem("adminSettings");
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      if (settings.enableAds) {
        // Show ad after a short delay to simulate app launch
        setTimeout(() => {
          setShowAd(true);
        }, 1000);
      }
    }
  }, []);

  const handleCloseAd = () => {
    setShowAd(false);
  };
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* AdMob Ad Overlay */}
      {showAd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="border-border bg-card p-6 max-w-md mx-4 relative">
            <Button
              onClick={handleCloseAd}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Sage Token Ad</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Watch this ad to earn bonus tokens! This is a demo AdMob
                integration.
              </p>
              <Button
                onClick={handleCloseAd}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Watch Ad (Demo)
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                AdMob integration ready for production
              </p>
            </div>
          </Card>
        </div>
      )}
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          {/* <Zap className="w-8 h-8 text-accent" /> */}
           <img src="./sage.jpeg" alt="logo" className="w-8 h-8" />
          <span className="text-2xl font-bold bg-linear-to-r from-accent to-primary bg-clip-text text-transparent">
            Sage Token
          </span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-foreground hover:text-accent"
            >
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Mine Sage Tokens
            <span className="block text-accent">Earn While You Work</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete tasks and earn Sage tokens in real-time. Join thousands of
            miners earning crypto rewards through simple, task-based mining.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Start Mining Now
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10 bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Grid Background */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(100,255,150,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,255,150,0.1) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Browse Tasks",
                desc: "Explore available mining tasks with varying difficulty and rewards",
              },
              {
                title: "Complete Work",
                desc: "4-hour mining sessions automatically track your progress",
              },
              {
                title: "Earn Tokens",
                desc: "Receive Sage tokens instantly upon completion",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { stat: "10K+", label: "Active Miners" },
              { stat: "2.5M", label: "Tokens Distributed" },
              { stat: "99.9%", label: "Uptime" },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-accent mb-2">
                  {item.stat}
                </div>
                <p className="text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-card/50 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Mining?</h2>
          <p className="text-muted-foreground mb-8">
            Join the Sage Token community and start earning tokens today.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-muted-foreground">
        <p>&copy; 2025 Sage Token Mining. All rights reserved.</p>
      </footer>
    </main>
  );
}
