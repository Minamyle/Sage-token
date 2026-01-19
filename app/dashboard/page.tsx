"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Zap,
  LogOut,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Send,
  Bell,
  Trash2,
  MessageCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { ToastContainer } from "@/components/notification-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationsPage } from "@/components/notifications-page";
import { ChatCenter } from "@/components/chat-center";

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

interface WithdrawalRequest {
  id: string;
  email: string;
  amount: number;
  walletId: string;
  status: "pending" | "completed";
  timestamp: number;
}

interface Referral {
  referrerId: string;
  referrerEmail: string;
  referredEmail: string;
  referredName: string;
  status: "pending" | "completed";
  rewardAmount: number;
  timestamp: number;
}

interface Stats {
  tasksCompleted: number;
  totalEarned: number;
  currentStreak: number;
  totalCompleted: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({
    tasksCompleted: 0,
    totalEarned: 0,
    currentStreak: 0,
    totalCompleted: 0,
  });
  const [activeTab, setActiveTab] = useState<
    | "mining"
    | "tasks"
    | "withdraw"
    | "referrals"
    | "notifications"
    | "info"
    | "whitepaper"
    | "chat"
    | "settings"
  >("mining");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<
    WithdrawalRequest[]
  >([]);
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralRewards, setReferralRewards] = useState(0);
  const [settings, setSettings] = useState({
    exchangeRate: 0.1,
    minWithdrawal: 100,
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toasts, removeToast, showSuccess, showError } = useNotifications();

  useEffect(() => {
    // Load user data
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);

      // Load completed tasks
      const completedTasksIds = localStorage.getItem(
        `completedTasks_${userData.email}`
      );
      if (completedTasksIds) {
        setCompletedTasks(JSON.parse(completedTasksIds));
      }

      // Generate referral code if not exists
      let refCode = localStorage.getItem(`referralCode_${userData.email}`);
      if (!refCode) {
        refCode = `SAGE-${userData.email
          .split("@")[0]
          .toUpperCase()}-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`;
        localStorage.setItem(`referralCode_${userData.email}`, refCode);
      }
      setReferralCode(refCode);

      // Load referral data
      const referralsStr = localStorage.getItem(`referrals_${userData.email}`);
      if (referralsStr) {
        setReferrals(JSON.parse(referralsStr));
      }

      const rewardsStr = localStorage.getItem(
        `referralRewards_${userData.email}`
      );
      if (rewardsStr) {
        setReferralRewards(Number.parseInt(rewardsStr));
      }
    }

    // Load admin tasks
    const tasksStr = localStorage.getItem("adminTasks");
    if (tasksStr) {
      try {
        const allTasks = JSON.parse(tasksStr);
        // Migrate old "normal" type to "mining"
        const migratedTasks = allTasks.map((task: any) => ({
          ...task,
          type: task.type === "normal" ? "mining" : task.type,
        }));
        setTasks(migratedTasks);
      } catch {
        setTasks([]);
      }
    } else {
      const defaultTasks: Task[] = [
        {
          id: "1",
          title: "Data Validation",
          description: "Validate and clean dataset",
          reward: 500,
          difficulty: "easy",
          type: "mining",
          timeframe: 4,
          completedBy: [],
        },
        {
          id: "2",
          title: "Content Review",
          description: "Review and categorize content",
          reward: 350,
          difficulty: "medium",
          type: "mining",
          timeframe: 4,
          completedBy: [],
        },
        {
          id: "3",
          title: "Quality Assurance",
          description: "Test platform features",
          reward: 600,
          difficulty: "hard",
          type: "mining",
          timeframe: 4,
          completedBy: [],
        },
      ];
      setTasks(defaultTasks);
    }

    // Load withdrawal history
    if (userStr) {
      const userEmail = JSON.parse(userStr).email;
      const withdrawalsStr = localStorage.getItem(`withdrawals_${userEmail}`);
      if (withdrawalsStr) {
        setWithdrawalHistory(JSON.parse(withdrawalsStr));
      }
    }

    // Load admin settings
    const settingsStr = localStorage.getItem("adminSettings");
    if (settingsStr) {
      try {
        setSettings(JSON.parse(settingsStr));
      } catch {
        // Keep default settings
      }
    }

    // Load notifications
    if (userStr) {
      const userEmail = JSON.parse(userStr).email;
      const notificationsStr = localStorage.getItem(
        `notifications_${userEmail}`
      );
      if (notificationsStr) {
        try {
          setNotifications(JSON.parse(notificationsStr));
        } catch {
          setNotifications([]);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Calculate stats from user completed tasks
    if (user && tasks.length > 0) {
      const totalRewards = completedTasks.reduce(
        (sum: number, taskId: string) => {
          const task = tasks.find((t) => t.id === taskId);
          return sum + (task?.reward || 0);
        },
        0
      );

      setStats({
        tasksCompleted: completedTasks.length,
        totalEarned: totalRewards,
        currentStreak: completedTasks.length,
        totalCompleted: tasks.length,
      });
    }
  }, [user, tasks, completedTasks]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    showSuccess("Logged Out", "You have been successfully logged out");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (!user) return;

    // Remove user from allUsers
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const updatedAllUsers = allUsers.filter((u: any) => u.email !== user.email);
    localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));

    // Remove all user-specific data
    const keysToRemove = [
      "user",
      "isLoggedIn",
      `user_profile_${user.email}`,
      `completedTasks_${user.email}`,
      `withdrawals_${user.email}`,
      `notifications_${user.email}`,
      `referrals_${user.email}`,
      `referralRewards_${user.email}`,
      `referralCode_${user.email}`,
    ];

    // Also remove mining sessions
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      if (key.startsWith(`mining_session_${user.email}_`)) {
        localStorage.removeItem(key);
      }
      if (key.startsWith(`user_${user.email}_completed_`)) {
        localStorage.removeItem(key);
      }
    });

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    showSuccess("Account Deleted", "Your account has been permanently deleted");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  const createNotification = (
    type: "task" | "withdrawal" | "referral" | "admin",
    title: string,
    message: string,
    email?: string
  ) => {
    if (!user) return;

    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      email,
    };

    const notificationsStr = localStorage.getItem(
      `notifications_${user.email}`
    );
    const notifications = notificationsStr ? JSON.parse(notificationsStr) : [];
    notifications.push(notification);
    localStorage.setItem(
      `notifications_${user.email}`,
      JSON.stringify(notifications)
    );
  };

  const handleRequestWithdrawal = () => {
    if (!user) return;

    const amount = Number.parseInt(withdrawalAmount);
    if (!amount || amount <= 0) {
      showError("Invalid Amount", "Please enter a valid amount");
      return;
    }

    if (amount < settings.minWithdrawal) {
      showError(
        "Minimum Withdrawal",
        `Minimum withdrawal amount is ${settings.minWithdrawal} ST`
      );
      return;
    }

    if (amount > user.tokenBalance) {
      showError("Insufficient Balance", "You don't have enough tokens");
      return;
    }

    const withdrawal: WithdrawalRequest = {
      id: Date.now().toString(),
      email: user.email,
      amount,
      walletId: user.walletId,
      status: "pending",
      timestamp: Date.now(),
    };

    const updatedUser = { ...user, tokenBalance: user.tokenBalance - amount };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setWithdrawalHistory([...withdrawalHistory, withdrawal]);
    localStorage.setItem(
      `withdrawals_${user.email}`,
      JSON.stringify([...withdrawalHistory, withdrawal])
    );
    setWithdrawalAmount("");

    // Create withdrawal notification
    createNotification(
      "withdrawal",
      "Withdrawal Request Submitted",
      `Your withdrawal request for ${amount} ST has been submitted and is pending approval.`,
      user.email
    );

    showSuccess(
      "Withdrawal Requested",
      `Request for ${amount} ST submitted for processing`
    );
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    showSuccess("Copied!", "Referral code copied to clipboard");
  };

  const handleChangePassword = () => {
    if (!user) return;

    // Get user password from localStorage
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const currentUserData = allUsers.find((u: any) => u.email === user.email);

    if (!currentUserData) {
      showError("Error", "User data not found");
      return;
    }

    if (currentPassword !== currentUserData.password) {
      showError("Error", "Current password is incorrect");
      return;
    }

    if (newPassword.length < 6) {
      showError("Error", "New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Error", "New passwords do not match");
      return;
    }

    // Update password in allUsers
    const updatedAllUsers = allUsers.map((u: any) =>
      u.email === user.email ? { ...u, password: newPassword } : u
    );
    localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));

    // Update password in user_profile if exists
    const userProfileStr = localStorage.getItem(`user_profile_${user.email}`);
    if (userProfileStr) {
      const userProfile = JSON.parse(userProfileStr);
      userProfile.password = newPassword;
      localStorage.setItem(
        `user_profile_${user.email}`,
        JSON.stringify(userProfile)
      );
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    showSuccess(
      "Password Changed",
      "Your password has been successfully updated"
    );
  };

  if (!user) return null;

  const miningTasks = tasks.filter((task) => task.type === "mining");
  const otherTasks = tasks.filter((task) => task.type !== "mining");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <Zap className="w-8 h-8 text-accent" /> */}
            <img src="./sage.jpeg" alt="logo" className="w-8 h-8" />
            <span className="text-2xl font-bold">Sage Token</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold text-accent">
                {user?.tokenBalance || 0} ST
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ≈ ${(user?.tokenBalance || 0) * settings.exchangeRate}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <Card className="border-border bg-card mb-8 p-6">
          <div className="flex items-start justify-between flex-col md:flex-row gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.fullName}</h1>
              <div className="space-y-2">
                <p className="text-muted-foreground flex items-center gap-2">
                  <span className="text-sm">Email: {user.email}</span>
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-mono">{user.walletId}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-destructive-foreground hover:bg-destructive/90"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your account? This action
                      cannot be undone. All your data, balance, and progress
                      will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Tasks Completed
                </p>
                <p className="text-3xl font-bold">{stats.tasksCompleted}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-accent opacity-20" />
            </div>
          </Card>
          <Card className="border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Earned
                </p>
                <p className="text-3xl font-bold text-accent">
                  {stats.totalEarned}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent opacity-20" />
            </div>
          </Card>
          <Card className="border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Current Streak
                </p>
                <p className="text-3xl font-bold">{stats.currentStreak}</p>
              </div>
              <Cpu className="w-8 h-8 text-accent opacity-20" />
            </div>
          </Card>
          <Card className="border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Available Tasks
                </p>
                <p className="text-3xl font-bold">{stats.totalCompleted}</p>
              </div>
              <Clock className="w-8 h-8 text-accent opacity-20" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border flex-wrap">
          <Button
            onClick={() => setActiveTab("mining")}
            variant={activeTab === "mining" ? "default" : "ghost"}
            className={
              activeTab === "mining" ? "bg-accent text-accent-foreground" : ""
            }
          >
            <Cpu className="w-4 h-4 mr-2" />
            Mining
          </Button>
          <Button
            onClick={() => setActiveTab("tasks")}
            variant={activeTab === "tasks" ? "default" : "ghost"}
            className={
              activeTab === "tasks" ? "bg-accent text-accent-foreground" : ""
            }
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Tasks
          </Button>
          <Button
            onClick={() => setActiveTab("referrals")}
            variant={activeTab === "referrals" ? "default" : "ghost"}
            className={
              activeTab === "referrals"
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <Zap className="w-4 h-4 mr-2" />
            Referrals
          </Button>
          <Button
            onClick={() => setActiveTab("withdraw")}
            variant={activeTab === "withdraw" ? "default" : "ghost"}
            className={
              activeTab === "withdraw" ? "bg-accent text-accent-foreground" : ""
            }
          >
            <Send className="w-4 h-4 mr-2" />
            Withdraw Tokens
          </Button>
          <Button
            onClick={() => setActiveTab("notifications")}
            variant={activeTab === "notifications" ? "default" : "ghost"}
            className={
              activeTab === "notifications"
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </Button>
          <Button
            onClick={() => setActiveTab("chat")}
            variant={activeTab === "chat" ? "default" : "ghost"}
            className={
              activeTab === "chat" ? "bg-accent text-accent-foreground" : ""
            }
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button
            onClick={() => setActiveTab("settings")}
            variant={activeTab === "settings" ? "default" : "ghost"}
            className={
              activeTab === "settings" ? "bg-accent text-accent-foreground" : ""
            }
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            onClick={() => setActiveTab("info")}
            variant={activeTab === "info" ? "default" : "ghost"}
            className={
              activeTab === "info" ? "bg-accent text-accent-foreground" : ""
            }
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Info
          </Button>
          <Button
            onClick={() => setActiveTab("whitepaper")}
            variant={activeTab === "whitepaper" ? "default" : "ghost"}
            className={
              activeTab === "whitepaper"
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <FileText className="w-4 h-4 mr-2" />
            Whitepaper
          </Button>
        </div>

        {/* Mining Tab */}
        {activeTab === "mining" && (
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Cpu className="w-6 h-6 text-accent" />
              Mining Sessions
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {miningTasks
                .filter((task) => !completedTasks.includes(task.id))
                .map((task) => {
                  const difficultyColor =
                    task.difficulty === "easy"
                      ? "bg-green-500/20 text-green-400"
                      : task.difficulty === "medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400";

                  return (
                    <Card
                      key={task.id}
                      className="border-border bg-card hover:border-accent/50 transition-colors"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold">{task.title}</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              {task.description}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <div
                              className={`px-2 py-1 rounded text-xs font-semibold ${difficultyColor}`}
                            >
                              {task.difficulty.charAt(0).toUpperCase() +
                                task.difficulty.slice(1)}
                            </div>
                            <div className="px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                              Mining
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <p className="text-muted-foreground text-sm">
                            Reward
                          </p>
                          <p className="font-semibold text-accent text-lg">
                            {task.reward} ST
                          </p>
                        </div>

                        <Link
                          href={`/mining/${task.id}`}
                          className="block mt-4"
                        >
                          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            Start Mining
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
            </div>

            {miningTasks.filter((task) => !completedTasks.includes(task.id))
              .length === 0 && (
              <Card className="border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  No mining sessions available. Check back later.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6 text-accent" />
              Tasks
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherTasks.map((task) => {
                const userCompleted = completedTasks.includes(task.id);
                const difficultyColor =
                  task.difficulty === "easy"
                    ? "bg-green-500/20 text-green-400"
                    : task.difficulty === "medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400";

                return (
                  <Card
                    key={task.id}
                    className={`border-border bg-card hover:border-accent/50 transition-colors ${
                      userCompleted ? "opacity-60" : ""
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{task.title}</h3>
                          <p className="text-muted-foreground text-sm mt-1">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <div
                            className={`px-2 py-1 rounded text-xs font-semibold ${difficultyColor}`}
                          >
                            {task.difficulty.charAt(0).toUpperCase() +
                              task.difficulty.slice(1)}
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              task.type === "social"
                                ? "bg-purple-500/20 text-purple-400"
                                : task.type === "youtube"
                                  ? "bg-red-500/20 text-red-400"
                                  : task.type === "article"
                                    ? "bg-orange-500/20 text-orange-400"
                                    : task.type === "twitter"
                                      ? "bg-sky-500/20 text-sky-400"
                                      : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {task.type.charAt(0).toUpperCase() +
                              task.type.slice(1)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <p className="text-muted-foreground text-sm">Reward</p>
                        <p className="font-semibold text-accent text-lg">
                          {task.reward} ST
                        </p>
                      </div>

                      {!userCompleted ? (
                        <Link
                          href={`/mining/${task.id}`}
                          className="block mt-4"
                        >
                          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            Start Task
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          disabled
                          className="w-full mt-4 bg-muted text-muted-foreground"
                        >
                          Completed ✓
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {otherTasks.length === 0 && (
              <Card className="border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  No tasks available. Check back later.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === "referrals" && (
          <div className="space-y-6">
            <Card className="border-border bg-card p-8">
              <h2 className="text-2xl font-bold mb-6">Referral Program</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your Referral Code
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <code className="flex-1 p-3 rounded bg-card border border-border font-mono text-sm">
                      {referralCode}
                    </code>
                    <Button
                      onClick={copyReferralCode}
                      size="sm"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">
                    Referral Rewards Earned
                  </p>
                  <p className="text-3xl font-bold text-accent mt-4">
                    {referralRewards} ST
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>How it works:</strong> Share your referral code with
                  friends. When they sign up using your code and complete their
                  first task, you'll earn 100 ST as a bonus!
                </p>
              </div>
            </Card>

            <Card className="border-border bg-card p-8">
              <h3 className="text-lg font-bold mb-4">
                Successful Referrals (
                {referrals.filter((r) => r.status === "completed").length})
              </h3>

              {referrals.length === 0 ? (
                <p className="text-muted-foreground">
                  No referrals yet. Share your code to start earning!
                </p>
              ) : (
                <div className="space-y-3">
                  {referrals
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((ref, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-semibold">{ref.referredName}</p>
                          <p className="text-xs text-muted-foreground">
                            {ref.referredEmail}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-accent">
                            +{ref.rewardAmount} ST
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(ref.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Withdrawal Tab */}
        {activeTab === "withdraw" && (
          <div className="space-y-6">
            <Card className="border-border bg-card p-8">
              <h2 className="text-2xl font-bold mb-6">
                Request Token Withdrawal
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Available Balance
                  </label>
                  <p className="text-3xl font-bold text-accent mt-2">
                    {user.tokenBalance} ST
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Wallet ID
                  </label>
                  <p className="text-muted-foreground mt-2 font-mono">
                    {user.walletId}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Amount to Withdraw (ST)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="Enter amount"
                      min={settings.minWithdrawal}
                      max={user.tokenBalance}
                      className="bg-input border-border text-foreground flex-1"
                    />
                    <Button
                      onClick={handleRequestWithdrawal}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Request
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum withdrawal: {settings.minWithdrawal} ST
                  </p>
                </div>
              </div>
            </Card>

            {/* Withdrawal History */}
            <Card className="border-border bg-card p-8">
              <h3 className="text-lg font-bold mb-4">Withdrawal History</h3>

              {withdrawalHistory.length === 0 ? (
                <p className="text-muted-foreground">
                  No withdrawal requests yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {withdrawalHistory.map((wd) => (
                    <div
                      key={wd.id}
                      className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-semibold">{wd.amount} ST</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(wd.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          wd.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {wd.status.charAt(0).toUpperCase() + wd.status.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Bell className="w-6 h-6 text-accent" />
              Notifications
            </h2>
            <NotificationsPage userEmail={user.email} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="border-border bg-card p-8">
              <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Current Password
                      </label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="mt-2 bg-input border-border text-foreground"
                      />
                    </div>

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
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="mt-2 bg-input border-border text-foreground"
                      />
                    </div>

                    <Button
                      onClick={handleChangePassword}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Terms & Conditions */}
            <Card className="border-border bg-card p-8">
              <h2 className="text-2xl font-bold mb-6">Terms & Conditions</h2>

              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    1. Acceptance of Terms
                  </h3>
                  <p>
                    By accessing and using the Sage Token platform, you accept
                    and agree to be bound by the terms and provision of this
                    agreement.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    2. Mining Sessions
                  </h3>
                  <p>
                    Mining sessions are time-based activities where users can
                    earn Sage Tokens. Sessions are managed by administrators and
                    may be subject to change.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    3. Token Rewards
                  </h3>
                  <p>
                    Token rewards are distributed based on completed tasks and
                    mining sessions. All rewards are subject to platform
                    policies and may be adjusted by administrators.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    4. Withdrawals
                  </h3>
                  <p>
                    Users may withdraw tokens subject to minimum withdrawal
                    limits set by administrators. All withdrawals are processed
                    manually and may take time to complete.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    5. User Conduct
                  </h3>
                  <p>
                    Users must conduct themselves appropriately and follow all
                    platform rules. Violation of terms may result in account
                    suspension or termination.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    6. Privacy
                  </h3>
                  <p>
                    Your privacy is important to us. We collect and use personal
                    information only as described in our Privacy Policy.
                  </p>
                </div>
              </div>
            </Card>

            {/* Roadmap */}
            <Card className="border-border bg-card p-8">
              <h2 className="text-2xl font-bold mb-6">Roadmap</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Phase 1 - Core Mining Platform
                    </h3>
                    <p className="text-muted-foreground">
                      Basic mining functionality, task completion, and token
                      rewards system.
                    </p>
                    <p className="text-xs text-green-400 mt-1">✓ Completed</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Phase 2 - Advanced Features
                    </h3>
                    <p className="text-muted-foreground">
                      AdMob integration, social media tasks, enhanced mining
                      interface with boost functionality.
                    </p>
                    <p className="text-xs text-blue-400 mt-1">In Progress</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Phase 3 - Mobile App
                    </h3>
                    <p className="text-muted-foreground">
                      Native mobile applications for iOS and Android with
                      enhanced user experience.
                    </p>
                    <p className="text-xs text-yellow-400 mt-1">Planned</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Phase 4 - DeFi Integration
                    </h3>
                    <p className="text-muted-foreground">
                      Integration with decentralized exchanges, staking, and
                      yield farming opportunities.
                    </p>
                    <p className="text-xs text-purple-400 mt-1">Future</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Phase 5 - Global Expansion
                    </h3>
                    <p className="text-muted-foreground">
                      Multi-language support, global partnerships, and expanded
                      market reach.
                    </p>
                    <p className="text-xs text-orange-400 mt-1">Future</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Whitepaper Tab */}
        {activeTab === "whitepaper" && (
          <div className="space-y-6">
            <Card className="border-border bg-card p-8">
              <h2 className="text-2xl font-bold mb-6">Sage Token Whitepaper</h2>

              <div className="space-y-6 text-foreground">
                {/* Abstract */}
                <div>
                  <h3 className="text-xl font-bold mb-3">Abstract</h3>
                  <p className="text-muted-foreground">
                    Sage is a decentralized community token, first mobile-first
                    mining ecosystem designed to make cryptocurrency accessible
                    to everyone. Using a gamified, tap-to-mine mobile app
                    connected to a secure cloud backend, users can mine the Sage
                    token without technical knowledge or hardware. By combining
                    Web3 social media, DAO governance, and real-world utility
                    through smart contract functionality, brings the
                    decentralized economy to billions of mobile users.
                  </p>
                </div>

                {/* Origin */}
                <div>
                  <h3 className="text-xl font-bold mb-3">
                    1. Origin of Cryptocurrency
                  </h3>
                  <p className="text-muted-foreground">
                    Cryptocurrency emerged in 2008 with the Bitcoin whitepaper
                    by Satoshi Nakamoto. It proposed a decentralized financial
                    system, removing reliance on centralized banks. Bitcoin's
                    Genesis Block was mined in 2009, launching a global
                    movement. Sage builds on this legacy to make blockchain
                    participation easy and mobile-first.
                  </p>
                </div>

                {/* Introduction */}
                <div>
                  <h3 className="text-xl font-bold mb-3">2. Introduction</h3>
                  <p className="text-muted-foreground">
                    Sage token turns smartphones into blockchain portals.
                    Through its cloud-powered mobile mining app, users can earn
                    Sage tokens without technical skills or expensive equipment.
                  </p>
                </div>

                {/* Challenges */}
                <div>
                  <h3 className="text-xl font-bold mb-3">
                    3. Challenges with Traditional Mining
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Expensive hardware (GPUs/ASICs)</li>
                    <li>Energy waste & environmental impact</li>
                    <li>Requires deep technical knowledge</li>
                  </ul>
                </div>

                {/* Solution */}
                <div>
                  <h3 className="text-xl font-bold mb-3">
                    4. The Sage Token Solution
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Tap-to-Mine: No hardware needed</li>
                    <li>Cloud Mining: Minimal device impact</li>
                    <li>Zero cost entry & easy onboarding</li>
                    <li>Web3-ready with token utility and governance</li>
                  </ul>
                </div>

                {/* Web3 */}
                <div>
                  <h3 className="text-xl font-bold mb-3">5. Why Web3?</h3>
                  <p className="text-muted-foreground">
                    Web3 decentralizes control of the internet. Sage leverages
                    this to give users full ownership of data, rewards, and
                    governance. Social platforms, tokens, and governance are
                    built into the app experience.
                  </p>
                </div>

                {/* Vision */}
                <div>
                  <h3 className="text-xl font-bold mb-3">6. Our Main Vision</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Enable Web3 social apps</li>
                    <li>Use Sage for real-world payments</li>
                    <li>Expand via community-driven growth</li>
                  </ul>
                </div>

                {/* Mining Roles */}
                <div>
                  <h3 className="text-xl font-bold mb-3">7. Mining Roles</h3>
                  <p className="text-muted-foreground">
                    Users mine Sage daily with just a simple tap. Rates decrease
                    over time to preserve scarcity. No technical setup is
                    needed.
                  </p>
                </div>

                {/* Tokenomics */}
                <div>
                  <h3 className="text-xl font-bold mb-3">8. Tokenomics</h3>
                  <div className="space-y-2 text-muted-foreground ml-4">
                    <p>
                      <strong>Name:</strong> Blockchain Sage
                    </p>
                    <p>
                      <strong>Symbol:</strong> Sage
                    </p>
                    <p>
                      <strong>Total Supply:</strong> 900,000,000,000,000 Sage
                      (900 trillion)
                    </p>
                    <p>
                      <strong>Chain:</strong> Binance Smart Chain (BEP-20)
                    </p>
                  </div>
                </div>

                {/* Roadmap */}
                <div>
                  <h3 className="text-xl font-bold mb-3">10. Roadmap</h3>
                  <div className="space-y-4 text-muted-foreground ml-4">
                    <div>
                      <p className="font-semibold text-foreground">
                        Phase 1: Foundation
                      </p>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>Project launch</li>
                        <li>Android mobile app release</li>
                        <li>Community building</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Phase 2: Growth
                      </p>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>iOS app release</li>
                        <li>KYC & verification system</li>
                        <li>DEX/CEX listings</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Phase 3: Utility Expansion
                      </p>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>Web3 Social Media Integration</li>
                        <li>In-App Wallet</li>
                        <li>Sage Payment Gateway</li>
                        <li>DAO Governance</li>
                        <li>Open SDK/API for developers</li>
                        <li>Decentralized Identity (DID)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div>
                  <h3 className="text-xl font-bold mb-3">11. Security Model</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Anti-bot Verification & Captcha</li>
                    <li>KYC & Duplicate Account Prevention</li>
                    <li>End-to-End Encryption</li>
                    <li>Audited Smart Contracts</li>
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-xl font-bold mb-3">
                    12. Contact & Social Media
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      <strong>Telegram:</strong>{" "}
                      <a
                        href="https://t.me/DecentralizedSagetoken"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        https://t.me/DecentralizedSagetoken
                      </a>
                    </p>
                    <p>
                      <strong>Twitter/X:</strong>{" "}
                      <a
                        href="https://x.com/Sagetokens?t=UQF-O7ArSLKYi1ecWXnSKQ&s=09"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        @Sagetokens
                      </a>
                    </p>
                    <p>
                      <strong>YouTube:</strong>{" "}
                      <a
                        href="https://youtube.com/@sagetoken?feature=shared"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        @sagetoken
                      </a>
                    </p>
                  </div>
                </div>

                {/* Conclusion */}
                <div>
                  <h3 className="text-xl font-bold mb-3">13. Conclusion</h3>
                  <p className="text-muted-foreground">
                    Sage represents the next evolution in decentralized
                    inclusion. By transforming mobile phones into gateways to
                    Web3, it empowers anyone to participate in blockchain
                    innovation effortlessly. With a sustainable token model,
                    transparent mining schedule, and global community — Sage is
                    ready to reshape mobile mining.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="space-y-6">
            <Card className="border-border bg-card p-8">
              <h2 className="text-2xl font-bold mb-6">Message Admin</h2>
              <p className="text-muted-foreground mb-6">
                Send a message to the admin team. They will respond to your
                inquiries as soon as possible.
              </p>
              <div className="h-96 border border-border rounded-lg p-4 bg-muted/30 overflow-auto mb-4">
                <ChatCenter
                  userEmail={user?.email || ""}
                  userName={user?.fullName || "User"}
                  isAdmin={false}
                />
              </div>
            </Card>

            {/* Social Media Links */}
            <Card className="border-border bg-card p-8">
              <h2 className="text-2xl font-bold mb-6">Follow Us</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href="https://t.me/DecentralizedSagetoken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <span className="text-xl">💬</span>
                    </div>
                    <div>
                      <p className="font-bold">Telegram</p>
                      <p className="text-sm text-muted-foreground">
                        Join our community
                      </p>
                    </div>
                  </div>
                </a>
                <a
                  href="https://x.com/Sagetokens?t=UQF-O7ArSLKYi1ecWXnSKQ&s=09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg bg-black/10 border border-black/20 hover:bg-black/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-black/20 flex items-center justify-center">
                      <span className="text-xl">𝕏</span>
                    </div>
                    <div>
                      <p className="font-bold">Twitter/X</p>
                      <p className="text-sm text-muted-foreground">
                        Latest updates
                      </p>
                    </div>
                  </div>
                </a>
                <a
                  href="https://youtube.com/@sagetoken?feature=shared"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <span className="text-xl">📺</span>
                    </div>
                    <div>
                      <p className="font-bold">YouTube</p>
                      <p className="text-sm text-muted-foreground">
                        Watch tutorials
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </Card>
          </div>
        )}
      </div>
      {/* Chat Center Button */}
      {user && (
        <ChatCenter
          userEmail={user.email}
          userName={user.fullName}
          isAdmin={false}
        />
      )}
    </main>
  );
}
