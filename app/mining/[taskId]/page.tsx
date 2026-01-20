"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ToastContainer } from "@/components/notification-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { useParams } from "next/navigation";
import { Zap, Play, Rocket, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Task {
  id: number;
  title: string;
  description: string;
  reward_amount: number;
  task_type: "mining" | "social" | "youtube" | "article" | "twitter" | "admob";
  is_active: boolean;
  created_at: string;
  is_completed: boolean;
  timeframe?: number;
  difficulty?: string;
  reward?: number;
}

interface User {
  fullName: string;
  email: string;
  walletId: string;
  tokenBalance: number;
}

interface MiningSession {
  session_id: number;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  token_reward_rate: number;
  boost_count?: number;
}

export default function MiningPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<Task | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [miningSession, setMiningSession] = useState<MiningSession | null>(
    null
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isMining, setIsMining] = useState(false);
  const [canBoost, setCanBoost] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [boostCount, setBoostCount] = useState(0);
  const { toasts, removeToast, showSuccess, showError } = useNotifications();

  const createNotification = (
    userEmail: string,
    type: "task" | "withdrawal" | "referral" | "admin",
    title: string,
    message: string
  ) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
    };

    const notificationsStr = localStorage.getItem(`notifications_${userEmail}`);
    const notifications = notificationsStr ? JSON.parse(notificationsStr) : [];
    notifications.push(notification);
    localStorage.setItem(
      `notifications_${userEmail}`,
      JSON.stringify(notifications)
    );
  };

  const startMining = async () => {
    if (!user || !task) return;

    try {
      const response = await apiClient.startMining();
      setMiningSession(response);
      setIsMining(true);
      setBoostCount(response.boost_count || 0);
      showSuccess(
        "Mining Started",
        `Mining session started for ${response.duration_seconds / 60} minutes`
      );
    } catch (error) {
      console.error("Failed to start mining:", error);
      showError(
        "Failed to start mining",
        error instanceof Error ? error.message : "Please try again"
      );
    }
  };

  const boostMining = async () => {
    if (!miningSession || boostCount >= 20) return;

    // Show ad modal
    setShowAdModal(true);
  };

  const handleAdWatched = async () => {
    if (!miningSession || boostCount >= 20) return;

    try {
      const response = await apiClient.boostMining({
        session_id: miningSession.session_id,
      });

      setBoostCount(response.boost_count);
      setMiningSession({
        ...miningSession,
        end_time: response.new_end_time,
        boost_count: response.boost_count,
      });
      setShowAdModal(false);

      const multiplierDisplay = (response.boost_count * 10).toFixed(0);
      showSuccess(
        "Boost Applied!",
        `Mining boosted to ${multiplierDisplay}% reward. ${
          20 - response.boost_count
        } more boosts available!`
      );

      if (response.boost_count >= 20) {
        showSuccess(
          "Max Boost Reached!",
          "You've reached the maximum 20x boost multiplier!"
        );
      }
    } catch (error) {
      console.error("Failed to boost mining:", error);
      showError(
        "Failed to boost mining",
        error instanceof Error ? error.message : "Please try again"
      );
      setShowAdModal(false);
    }
  };

  const completeMiningSession = async (session: MiningSession) => {
    try {
      const response = await apiClient.completeMining({
        session_id: session.session_id,
      });

      // Update user balance
      const updatedUser = {
        ...user!,
        tokenBalance: response.new_balance,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      createNotification(
        user!.email,
        "task",
        "Mining Completed!",
        `You earned ${response.tokens_earned} ST from mining session.`
      );

      showSuccess(
        "Mining Completed!",
        `You earned ${response.tokens_earned} ST!`
      );
    } catch (error) {
      console.error("Failed to complete mining:", error);
      showError(
        "Failed to complete mining",
        error instanceof Error ? error.message : "Please try again"
      );
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const loadData = async () => {
      // Load user data
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      }

      // Load task data from API
      try {
        const tasks = await apiClient.getTasks();
        const foundTask = tasks.find((t: Task) => t.id === parseInt(taskId));
        setTask(foundTask || null);
      } catch (error) {
        console.error("Failed to load task:", error);
        setTask(null);
      }

      // Check for active mining session
      const checkActiveSession = async () => {
        try {
          const response = await apiClient.getActiveMiningSession();
          if (response.is_active) {
            setMiningSession({
              session_id: response.mining_circle_id!,
              start_time: response.start_time!,
              end_time: response.end_time!,
              duration_seconds: response.duration_seconds!,
              token_reward_rate: response.token_reward_rate!,
              boost_count: 0, // This might need to be fetched separately
            });
            setIsMining(true);
            setBoostCount(0); // Initialize boost count for active session
          }
        } catch (error) {
          console.error("Failed to check active session:", error);
        }
      };

      if (userStr) {
        checkActiveSession();
      }
    };

    loadData();
  }, [taskId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMining && miningSession) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(miningSession.end_time).getTime();
        const remaining = Math.max(0, endTime - now);
        setTimeLeft(remaining);

        const startTime = new Date(miningSession.start_time).getTime();
        const totalTime = endTime - startTime;
        const elapsed = totalTime - remaining;
        setProgress((elapsed / totalTime) * 100);

        if (remaining <= 0) {
          setIsMining(false);
          completeMiningSession(miningSession);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMining, miningSession]);

  if (!task || !user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Loading task...</p>
        </Card>
      </main>
    );
  }

  // Check if task is already completed
  if (task.is_completed) {
    return (
      <main className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-foreground flex items-center justify-center">
        <Card className="border-blue-500/40 bg-slate-800/80 p-12 text-center max-w-md backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Task Completed!
          </h2>
          <p className="text-blue-300 mb-8">
            You have successfully completed this task and earned{" "}
            {task.reward_amount} ST.
          </p>
          <Link href="/dashboard">
            <Button className="bg-blue-500 text-white hover:bg-blue-600">
              Return to Dashboard
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  // Handle mining-type tasks with the mining interface
  if (task.task_type === "mining") {
    return (
      <main className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-foreground flex flex-col">
        <ToastContainer toasts={toasts} onClose={removeToast} />

        {/* Ad Modal */}
        {showAdModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <Card className="border-blue-500/40 bg-slate-800/90 p-8 max-w-md text-center">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-5xl">📺</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Watch Ad</h3>
                <p className="text-blue-300 text-sm">
                  Watch a 5-second advertisement to boost your mining rewards!
                </p>
              </div>

              <div className="bg-slate-900/50 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-xs text-blue-300 mb-2">
                  CURRENT BOOST LEVEL
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-blue-400">
                    {boostCount + 1}x
                  </span>
                  <span className="text-xs text-blue-300">
                    {boostCount}/20 boosts used
                  </span>
                </div>
                <div className="w-full h-2 bg-blue-500/20 rounded-full mt-3">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(boostCount / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleAdWatched}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 text-base"
                >
                  Watch Ad (5 sec)
                </Button>
                <Button
                  onClick={() => setShowAdModal(false)}
                  variant="ghost"
                  className="w-full text-blue-300 hover:text-blue-200"
                >
                  Skip
                </Button>
              </div>
            </Card>
          </div>
        )}

        <header className="sticky top-0 z-10 border-b border-blue-500/20 bg-slate-900/80 backdrop-blur-md">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Sage Mining</h1>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Mining Interface */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-sm text-blue-300 font-semibold uppercase tracking-widest">
                  Mining Reward
                </span>
                {miningSession && (miningSession.boost_count || 0) > 0 && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                    {miningSession.boost_count}x BOOSTED
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-6xl font-bold text-blue-400">
                  {miningSession
                    ? Math.floor(
                        (miningSession.token_reward_rate *
                          miningSession.duration_seconds) /
                          60
                      )
                    : task.reward_amount}
                </span>
                <span className="text-3xl font-bold text-blue-300">ST</span>
              </div>
              {miningSession && (miningSession.boost_count || 0) > 0 && (
                <p className="text-xs text-yellow-400 mt-2">
                  +{(miningSession.boost_count || 0) * 10}% reward boost
                </p>
              )}
            </div>

            <div className="relative w-80 h-80 mx-auto mb-8">
              {/* Progress Circle */}
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(59, 130, 246, 0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(59, 130, 246, 0.8)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 45 * (1 - progress / 100)
                  }`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {isMining ? formatTime(timeLeft) : "Ready"}
                  </div>
                  <div className="text-xs text-blue-300 uppercase tracking-widest">
                    {isMining ? "Time Left" : "Start Mining"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-blue-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {task.title}
                </h2>
                <p className="text-blue-200 text-sm">{task.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-500/20">
                <div className="text-center">
                  <p className="text-xs text-blue-300 mb-1 font-semibold uppercase tracking-widest">
                    Duration
                  </p>
                  <p className="text-lg font-bold text-white">
                    {task.timeframe || 4} min
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-blue-300 mb-1 font-semibold uppercase tracking-widest">
                    Difficulty
                  </p>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
                      (task.difficulty || "easy") === "easy"
                        ? "bg-green-500/20 text-green-400 border border-green-500/50"
                        : (task.difficulty || "easy") === "medium"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                          : "bg-red-500/20 text-red-400 border border-red-500/50"
                    }`}
                  >
                    {task.difficulty || "easy"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {!isMining ? (
                <Button
                  onClick={startMining}
                  size="lg"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-base font-bold py-7 rounded-2xl shadow-lg shadow-blue-500/50 transition-all hover:shadow-blue-500/80"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Mining
                </Button>
              ) : (
                <>
                  <Button
                    onClick={boostMining}
                    disabled={boostCount >= 20}
                    size="lg"
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-base font-bold py-7 rounded-2xl shadow-lg shadow-yellow-500/50 transition-all hover:shadow-yellow-500/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Boost ({boostCount}/20)
                  </Button>
                </>
              )}
            </div>

            {isMining && (
              <div className="mt-4 text-center">
                <p className="text-xs text-blue-300">
                  Watch ads to boost mining up to 20x! Each boost adds +10%
                  reward and reduces time by 2 seconds.
                </p>
                {boostCount >= 20 && (
                  <p className="text-xs text-yellow-400 mt-2 font-semibold">
                    Maximum boost level reached!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Handle other task types with completion interface
  const userCompleted = false; // API will handle completion status

  if (userCompleted) {
    return (
      <main className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-foreground flex items-center justify-center">
        <Card className="border-blue-500/40 bg-slate-800/80 p-12 text-center max-w-md backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Task Completed!
          </h2>
          <p className="text-blue-300 mb-8">
            You have successfully completed this task and earned{" "}
            {task.reward_amount} ST.
          </p>
          <Link href="/dashboard">
            <Button className="bg-blue-500 text-white hover:bg-blue-600">
              Return to Dashboard
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  // Task completion interface for non-mining tasks
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-foreground flex flex-col">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <header className="sticky top-0 z-10 border-b border-blue-500/20 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Task Completion</h1>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm text-blue-300 font-semibold uppercase tracking-widest">
                Task Reward
              </span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-6xl font-bold text-blue-400">
                {task.reward_amount}
              </span>
              <span className="text-3xl font-bold text-blue-300">ST</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-blue-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">
                {task.title}
              </h2>
              <p className="text-blue-200 text-sm mb-4">{task.description}</p>

              {/* Task-specific instructions */}
              {task.task_type === "social" && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <p className="text-blue-300 text-sm mb-2">
                    Follow this account:
                  </p>
                  <p className="text-blue-400">
                    Social media task - complete the required action
                  </p>
                </div>
              )}

              {task.task_type === "youtube" && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-red-300 text-sm mb-2">Watch this video:</p>
                  <p className="text-red-400">
                    YouTube task - watch the required video
                  </p>
                </div>
              )}

              {task.task_type === "article" && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                  <p className="text-orange-300 text-sm mb-2">
                    Read this article:
                  </p>
                  <p className="text-orange-400">
                    Article task - read the required content
                  </p>
                </div>
              )}

              {task.task_type === "twitter" && (
                <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 mb-4">
                  <p className="text-sky-300 text-sm mb-2">
                    Follow this account:
                  </p>
                  <p className="text-sky-400">
                    Twitter task - complete the required action
                  </p>
                </div>
              )}

              {task.task_type === "admob" && (
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 text-sm">
                    Watch the AdMob advertisement to complete this task.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-blue-500/20 mb-6">
              <div className="text-center flex-1">
                <p className="text-xs text-blue-300 mb-1 font-semibold uppercase tracking-widest">
                  Task Type
                </p>
                <div className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/50">
                  {task.task_type}
                </div>
              </div>
            </div>

            <Button
              onClick={async () => {
                try {
                  const response = await apiClient.completeTask({
                    task_id: parseInt(taskId),
                  });

                  // Update user balance
                  const updatedUser = {
                    ...user,
                    tokenBalance: response.new_balance,
                  };
                  localStorage.setItem("user", JSON.stringify(updatedUser));

                  createNotification(
                    user.email,
                    "task",
                    "Task Completed!",
                    `You successfully completed "${task.title}" and earned ${response.reward_claimed} ST.`
                  );

                  showSuccess(
                    "Task Completed!",
                    `You earned ${response.reward_claimed} ST!`
                  );

                  // Redirect after a short delay
                  setTimeout(() => {
                    window.location.href = "/dashboard";
                  }, 2000);
                } catch (error) {
                  console.error("Failed to complete task:", error);
                  showError(
                    "Failed to complete task",
                    error instanceof Error ? error.message : "Please try again"
                  );
                }
              }}
              size="lg"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base font-bold py-7 rounded-2xl shadow-lg shadow-blue-500/50 transition-all hover:shadow-blue-500/80"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Complete Task
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
