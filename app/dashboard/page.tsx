"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import Link from "next/link";
import { ToastContainer } from "@/components/notification-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationsPage } from "@/components/notifications-page";

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
  const [stats, setStats] = useState<Stats>({
    tasksCompleted: 0,
    totalEarned: 0,
    currentStreak: 0,
    totalCompleted: 0,
  });
  const [activeTab, setActiveTab] = useState<
    "normal" | "withdraw" | "referrals" | "notifications"
  >("normal");
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
  const { toasts, removeToast, showSuccess, showError } = useNotifications();

  useEffect(() => {
    // Load user data
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);

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
  }, []);

  useEffect(() => {
    // Calculate stats from user completed tasks
    if (user) {
      const completedTasksIds = localStorage.getItem(
        `completedTasks_${user.email}`
      );
      const completed = completedTasksIds ? JSON.parse(completedTasksIds) : [];
      const totalRewards = completed.reduce((sum: number, taskId: string) => {
        const task = tasks.find((t) => t.id === taskId);
        return sum + (task?.reward || 0);
      }, 0);

      setStats({
        tasksCompleted: completed.length,
        totalEarned: totalRewards,
        currentStreak: completed.length,
        totalCompleted: tasks.length,
      });
    }
  }, [user, tasks]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    showSuccess("Logged Out", "You have been successfully logged out");
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

  if (!user) return null;

  const normalTasks = tasks;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-accent" />
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
            <Link href="/admin">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Admin Panel
              </Button>
            </Link>
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
            onClick={() => setActiveTab("normal")}
            variant={activeTab === "normal" ? "default" : "ghost"}
            className={
              activeTab === "normal" ? "bg-accent text-accent-foreground" : ""
            }
          >
            <Cpu className="w-4 h-4 mr-2" />
            Mining Tasks
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
          </Button>
        </div>

        {/* Normal Tasks Tab */}
        {activeTab === "normal" && (
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Cpu className="w-6 h-6 text-accent" />
              Mining Tasks
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {normalTasks.map((task) => {
                const userCompleted =
                  localStorage.getItem(
                    `user_${user.email}_completed_${task.id}`
                  ) === "true";
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
                              task.type === "mining"
                                ? "bg-blue-500/20 text-blue-400"
                                : task.type === "social"
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
                            Start Mining
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

            {normalTasks.length === 0 && (
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
      </div>
    </main>
  );
}
