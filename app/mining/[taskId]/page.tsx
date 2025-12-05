"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ToastContainer } from "@/components/notification-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { useParams } from "next/navigation";
import { Zap, Play, Rocket, CheckCircle2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: "easy" | "medium" | "hard";
  type: "mining" | "social" | "youtube" | "article" | "twitter" | "admob";
  timeframe?: number;
  completedBy: string[];
  socialLink?: string;
  youtubeUrl?: string;
  articleUrl?: string;
  twitterHandle?: string;
}

interface User {
  fullName: string;
  email: string;
  walletId: string;
  tokenBalance: number;
}

interface MiningSession {
  id: string;
  startTime: number;
  endTime: number;
  reward: number;
  isActive: boolean;
  boosted: boolean;
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

  const startMining = () => {
    if (!user || !task) return;

    const session: MiningSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      endTime: Date.now() + (task.timeframe || 4) * 60 * 1000, // Convert minutes to milliseconds
      reward: task.reward,
      isActive: true,
      boosted: false,
    };

    setMiningSession(session);
    setIsMining(true);
    localStorage.setItem(
      `mining_session_${user.email}_${taskId}`,
      JSON.stringify(session)
    );

    showSuccess(
      "Mining Started",
      `Mining session started for ${task.timeframe || 4} minutes`
    );
  };

  const boostMining = () => {
    if (!miningSession || !user) return;

    // Simulate watching an ad
    showSuccess("Ad Watched", "Mining rate boosted! +50% reward");

    const boostedSession = {
      ...miningSession,
      reward: miningSession.reward * 1.5,
      boosted: true,
    };

    setMiningSession(boostedSession);
    localStorage.setItem(
      `mining_session_${user.email}_${taskId}`,
      JSON.stringify(boostedSession)
    );
    setCanBoost(false);
  };

  const completeMiningSession = (session: MiningSession, userEmail: string) => {
    const updatedUser = {
      ...user!,
      tokenBalance: user!.tokenBalance + session.reward,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Update user profile
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const userIndex = allUsers.findIndex((u: any) => u.email === userEmail);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem("allUsers", JSON.stringify(allUsers));
    }

    localStorage.setItem(
      `user_profile_${userEmail}`,
      JSON.stringify(updatedUser)
    );
    localStorage.removeItem(`mining_session_${userEmail}_${taskId}`);

    createNotification(
      userEmail,
      "task",
      "Mining Completed!",
      `You earned ${session.reward} ST from mining session. ${
        session.boosted ? "(Boosted)" : ""
      }`
    );

    showSuccess("Mining Completed!", `You earned ${session.reward} ST!`);
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    const tasksStr = localStorage.getItem("adminTasks");
    if (tasksStr) {
      try {
        const tasks = JSON.parse(tasksStr);
        const foundTask = tasks.find(
          (t: Task) => t.id === taskId && t.type === "mining"
        );
        setTask(foundTask || null);
      } catch {
        setTask(null);
      }
    }

    // Check if user has active mining session
    if (userStr) {
      const userEmail = JSON.parse(userStr).email;
      const sessionStr = localStorage.getItem(
        `mining_session_${userEmail}_${taskId}`
      );
      if (sessionStr) {
        const session: MiningSession = JSON.parse(sessionStr);
        if (session.isActive && session.endTime > Date.now()) {
          setMiningSession(session);
          setIsMining(true);
        } else if (session.isActive) {
          // Session completed
          completeMiningSession(session, userEmail);
        }
      }
    }
  }, [taskId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMining && miningSession) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, miningSession.endTime - now);
        setTimeLeft(remaining);

        const totalTime = miningSession.endTime - miningSession.startTime;
        const elapsed = totalTime - remaining;
        setProgress((elapsed / totalTime) * 100);

        if (remaining <= 0) {
          setIsMining(false);
          if (user) {
            completeMiningSession(miningSession, user.email);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMining, miningSession, user]);

  if (!task || !user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Loading task...</p>
        </Card>
      </main>
    );
  }

  // Handle mining-type tasks with the mining interface
  if (task.type === "mining") {
    return (
      <main className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-foreground flex flex-col">
        <ToastContainer toasts={toasts} onClose={removeToast} />

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
                {miningSession?.boosted && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                    BOOSTED
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-6xl font-bold text-blue-400">
                  {miningSession ? miningSession.reward : task.reward}
                </span>
                <span className="text-3xl font-bold text-blue-300">ST</span>
              </div>
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
                      task.difficulty === "easy"
                        ? "bg-green-500/20 text-green-400 border border-green-500/50"
                        : task.difficulty === "medium"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                        : "bg-red-500/20 text-red-400 border border-red-500/50"
                    }`}
                  >
                    {task.difficulty}
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
                    disabled={!canBoost}
                    size="lg"
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-base font-bold py-7 rounded-2xl shadow-lg shadow-yellow-500/50 transition-all hover:shadow-yellow-500/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Boost (+50%)
                  </Button>
                  <div className="text-xs text-center text-blue-300 mt-2">
                    Watch ad to unlock boost
                  </div>
                </>
              )}
            </div>

            {isMining && (
              <div className="mt-4 text-center">
                <p className="text-xs text-blue-300">
                  Mining in progress... Ads will show at random intervals
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Handle other task types with completion interface
  const userCompleted =
    localStorage.getItem(`user_${user.email}_completed_${taskId}`) === "true";

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
            You have successfully completed this task and earned {task.reward}{" "}
            ST.
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
                {task.reward}
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
              {task.type === "social" && task.socialLink && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <p className="text-blue-300 text-sm mb-2">
                    Follow this account:
                  </p>
                  <a
                    href={task.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    {task.socialLink}
                  </a>
                </div>
              )}

              {task.type === "youtube" && task.youtubeUrl && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-red-300 text-sm mb-2">Watch this video:</p>
                  <a
                    href={task.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 underline hover:text-red-300"
                  >
                    {task.youtubeUrl}
                  </a>
                </div>
              )}

              {task.type === "article" && task.articleUrl && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                  <p className="text-orange-300 text-sm mb-2">
                    Read this article:
                  </p>
                  <a
                    href={task.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 underline hover:text-orange-300"
                  >
                    {task.articleUrl}
                  </a>
                </div>
              )}

              {task.type === "twitter" && task.twitterHandle && (
                <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 mb-4">
                  <p className="text-sky-300 text-sm mb-2">
                    Follow this account:
                  </p>
                  <a
                    href={`https://twitter.com/${task.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 underline hover:text-sky-300"
                  >
                    @{task.twitterHandle}
                  </a>
                </div>
              )}

              {task.type === "admob" && (
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
                  Difficulty
                </p>
                <div
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                    task.difficulty === "easy"
                      ? "bg-green-500/20 text-green-400 border border-green-500/50"
                      : task.difficulty === "medium"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                      : "bg-red-500/20 text-red-400 border border-red-500/50"
                  }`}
                >
                  {task.difficulty}
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                // Mark task as completed
                const updatedUser = {
                  ...user,
                  tokenBalance: user.tokenBalance + task.reward,
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));

                const allUsers = JSON.parse(
                  localStorage.getItem("allUsers") || "[]"
                );
                const userIndex = allUsers.findIndex(
                  (u: any) => u.email === user.email
                );
                if (userIndex !== -1) {
                  allUsers[userIndex] = updatedUser;
                  localStorage.setItem("allUsers", JSON.stringify(allUsers));
                }

                localStorage.setItem(
                  `user_${user.email}_completed_${taskId}`,
                  "true"
                );

                const completedTasksIds = localStorage.getItem(
                  `completedTasks_${user.email}`
                );
                const completed = completedTasksIds
                  ? JSON.parse(completedTasksIds)
                  : [];
                completed.push(taskId);
                localStorage.setItem(
                  `completedTasks_${user.email}`,
                  JSON.stringify(completed)
                );

                createNotification(
                  user.email,
                  "task",
                  "Task Completed!",
                  `You successfully completed "${task.title}" and earned ${task.reward} ST.`
                );

                showSuccess("Task Completed!", `You earned ${task.reward} ST!`);

                // Redirect after a short delay
                setTimeout(() => {
                  window.location.href = "/dashboard";
                }, 2000);
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
