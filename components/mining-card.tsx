"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"

interface MiningCardProps {
  taskId: string
  taskTitle: string
  reward: number
  difficulty: "easy" | "medium" | "hard"
  onStartMining: () => void
}

export function MiningCard({ taskId, taskTitle, reward, difficulty, onStartMining }: MiningCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onStartMining()
      setIsAnimating(false)
    }, 600)
  }

  return (
    <Card className="relative border-border bg-gradient-to-br from-card to-card/80 p-8 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div
        className="absolute -inset-full bg-gradient-conic from-accent/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-spin"
        style={{ animationDuration: "8s" }}
      />

      <style>{`
        @keyframes coin-zoom {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(100, 255, 150, 0.4)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 35px rgba(100, 255, 150, 0.8)); }
        }
        
        @keyframes coin-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .coin-zoom {
          animation: coin-zoom 2.5s ease-in-out infinite;
        }

        .coin-pulse-ring {
          animation: coin-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-80">
        {/* Pulse rings around coin */}
        <div className="absolute w-48 h-48 border-2 border-accent/30 rounded-full coin-pulse-ring" />
        <div
          className="absolute w-64 h-64 border border-accent/15 rounded-full coin-pulse-ring"
          style={{ animationDelay: "0.3s" }}
        />

        {/* Glowing coin */}
        <div className="coin-zoom">
          <div
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-accent via-accent/80 to-accent/60 flex items-center justify-center shadow-2xl"
            style={{
              boxShadow:
                "0 0 40px rgba(100, 255, 150, 0.6), 0 0 80px rgba(100, 255, 150, 0.3), inset -2px -2px 10px rgba(0,0,0,0.3)",
            }}
          >
            {/* Coin inner glow */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-t from-accent/40 to-transparent" />

            {/* Coin icon */}
            <Zap className="w-16 h-16 text-accent-foreground relative z-10" strokeWidth={1.5} />

            {/* Coin shine effect */}
            <div className="absolute top-4 left-6 w-12 h-12 rounded-full bg-white/30 blur-xl" />
          </div>
        </div>

        {/* Task info */}
        <div className="mt-12 text-center relative z-10">
          <h3 className="text-xl font-bold text-foreground mb-2">{taskTitle}</h3>
          <p className="text-accent text-2xl font-bold mb-4">{reward} ST Reward</p>

          {/* Difficulty indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex gap-1">
              {[...Array(difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-6 rounded-full ${
                    difficulty === "easy" ? "bg-green-500" : difficulty === "medium" ? "bg-yellow-500" : "bg-red-500"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">{difficulty}</span>
          </div>
        </div>

        {/* Start mining button */}
        <Button
          onClick={handleClick}
          disabled={isAnimating}
          className={`relative z-10 mt-8 bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg font-bold rounded-lg transition-all ${
            isAnimating ? "scale-95 opacity-70" : "hover:scale-105 active:scale-95"
          }`}
        >
          {isAnimating ? (
            <span className="flex items-center gap-2">
              <span className="inline-block animate-spin">⚡</span>
              Starting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>Start Mining</span>
              <Zap className="w-5 h-5" />
            </span>
          )}
        </Button>
      </div>
    </Card>
  )
}
