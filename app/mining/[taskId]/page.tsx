"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ToastContainer } from "@/components/notification-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { useParams } from "next/navigation";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: "easy" | "medium" | "hard";
  type: "normal";
  completedBy: string[];
}

interface User {
  fullName: string;
  email: string;
  walletId: string;
  tokenBalance: number;
}

const verifyTaskCompletion = (taskId: string): boolean => {
  return true;
};

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

export default function MiningPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<Task | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useNotifications();

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
          (t: Task) => t.id === taskId && t.type === "normal"
        );
        setTask(foundTask || null);
      } catch {
        setTask(null);
      }
    }

    if (userStr) {
      const userEmail = JSON.parse(userStr).email;
      const completed = localStorage.getItem(
        `user_${userEmail}_completed_${taskId}`
      );
      if (completed === "true") {
        setIsCompleted(true);
      }
    }
  }, [taskId]);

  const handleCompleteTask = () => {
    if (!user || !task) return;

    if (!verifyTaskCompletion(taskId)) {
      showError(
        "Incomplete Task",
        "You must complete this task to earn rewards"
      );
      return;
    }

    const updatedUser = {
      ...user,
      tokenBalance: user.tokenBalance + task.reward,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const userIndex = allUsers.findIndex((u: any) => u.email === user.email);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem("allUsers", JSON.stringify(allUsers));
    } else {
      allUsers.push(updatedUser);
      localStorage.setItem("allUsers", JSON.stringify(allUsers));
    }

    localStorage.setItem(`user_${user.email}_completed_${taskId}`, "true");

    const completedTasksIds = localStorage.getItem(
      `completedTasks_${user.email}`
    );
    const completed = completedTasksIds ? JSON.parse(completedTasksIds) : [];

    // If this is the user's first completed task, check if they were referred
    if (completed.length === 0) {
      const allUsersData = JSON.parse(localStorage.getItem("allUsers") || "[]");

      // Find the referrer by checking all referral lists
      for (const referrerUser of allUsersData) {
        const referralsStr = localStorage.getItem(
          `referrals_${referrerUser.email}`
        );
        if (referralsStr) {
          const referrals = JSON.parse(referralsStr);
          const userReferral = referrals.find(
            (r: any) => r.referredEmail === user.email && r.status === "pending"
          );

          if (userReferral) {
            // Mark referral as completed and award referrer
            userReferral.status = "completed";
            const updatedReferrals = referrals.map((r: any) =>
              r.referredEmail === user.email ? userReferral : r
            );
            localStorage.setItem(
              `referrals_${referrerUser.email}`,
              JSON.stringify(updatedReferrals)
            );

            const referrerIndex = allUsersData.findIndex(
              (u: any) => u.email === referrerUser.email
            );
            if (referrerIndex !== -1) {
              allUsersData[referrerIndex].tokenBalance +=
                userReferral.rewardAmount;
              localStorage.setItem("allUsers", JSON.stringify(allUsersData));
            }

            const rewardsStr = localStorage.getItem(
              `referralRewards_${referrerUser.email}`
            );
            const currentRewards = rewardsStr ? Number.parseInt(rewardsStr) : 0;
            localStorage.setItem(
              `referralRewards_${referrerUser.email}`,
              String(currentRewards + userReferral.rewardAmount)
            );

            // Create referral notification
            createNotification(
              referrerUser.email,
              "referral",
              "Referral Reward Earned",
              `Your referred user ${user.fullName} completed their first task. You earned ${userReferral.rewardAmount} ST!`
            );
          }
        }
      }
    }

    completed.push(taskId);
    localStorage.setItem(
      `completedTasks_${user.email}`,
      JSON.stringify(completed)
    );
    setIsCompleted(true);

    // Create task completion notification
    createNotification(
      user.email,
      "task",
      "Task Completed!",
      `You successfully completed "${task.title}" and earned ${task.reward} ST.`
    );

    showSuccess(
      "Task Completed!",
      `You earned ${task.reward} ST for completing "${task.title}"`
    );
  };

  if (!task || !user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Loading task...</p>
        </Card>
      </main>
    );
  }

  if (!isCompleted) {
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
            <div className="mb-12 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-sm text-blue-300 font-semibold uppercase tracking-widest">
                  Mining Reward
                </span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-6xl font-bold text-blue-400">
                  {task.reward}
                </span>
                <span className="text-3xl font-bold text-blue-300">ST</span>
              </div>
            </div>

            <div className="relative w-80 h-80 mx-auto mb-16">
              {/* Outer glow effect */}
              <div className="absolute inset-0 rounded-full bg-linear-to-b from-blue-500/40 to-transparent blur-3xl"></div>

              {/* Main circular border */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/60 bg-linear-to-br from-blue-600/30 to-slate-900/50 shadow-2xl shadow-blue-500/50 flex items-center justify-center">
                {/* Inner gradient circle */}
                <div className="w-72 h-72 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center relative overflow-hidden">
                  {/* Rotating shine effect */}
                  <div className="absolute inset-0 rounded-full opacity-30 bg-linear-to-tr from-white/0 via-white/20 to-white/0"></div>

                  {/* Center content with SVG logo style */}
                  <div className="flex flex-col items-center justify-center relative z-10">
                    <svg
                      className="w-24 h-24 mb-2"
                      viewBox="0 0 100 100"
                      fill="none"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="white"
                        strokeWidth="2"
                        opacity="0.3"
                      />
                      <path d="M50 20L75 65H25Z" fill="white" />
                      <circle
                        cx="50"
                        cy="50"
                        r="12"
                        fill="white"
                        opacity="0.8"
                      />
                    </svg>
                    <div className="text-2xl font-bold text-white">ST</div>
                    <div className="text-xs font-semibold text-blue-100 uppercase tracking-widest mt-1">
                      Sage Token
                    </div>
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

              <div className="flex items-center justify-center gap-4 pt-4 border-t border-blue-500/20">
                <div className="text-center">
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
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCompleteTask}
                size="lg"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-base font-bold py-7 rounded-2xl shadow-lg shadow-blue-500/50 transition-all hover:shadow-blue-500/80"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Claim Reward
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Completed state
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
        <h2 className="text-3xl font-bold text-white mb-2">Task Completed!</h2>
        <p className="text-blue-300 mb-8">
          You have successfully completed this task and earned {task.reward} ST.
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
