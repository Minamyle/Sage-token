"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Zap,
  ArrowLeft,
  Trash2,
  Edit2,
  Save,
  X,
  BarChart3,
  Users,
  CpuIcon,
  Eye,
  EyeOff,
  Award,
  Send,
  CheckCircle2,
  Bell,
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: "easy" | "medium" | "hard";
  type: "mining" | "social" | "youtube" | "article" | "twitter" | "admob";
  timeframe?: number; // in minutes
  completedBy: string[];
  // Additional fields for different task types
  socialLink?: string;
  youtubeUrl?: string;
  articleUrl?: string;
  twitterHandle?: string;
}

interface UserProfile {
  fullName: string;
  email: string;
  walletId: string;
  tokenBalance: number;
  tasksCompleted: number;
  totalEarned: number;
  joinedDate: number;
}

interface WithdrawalRequest {
  id: string;
  email: string;
  amount: number;
  walletId: string;
  status: "pending" | "completed";
  timestamp: number;
}

interface AdminStats {
  totalTasks: number;
  totalUsers: number;
  totalTokensDistributed: number;
  avgTaskReward: number;
  pendingWithdrawals: number;
}

interface AdminSettings {
  exchangeRate: number;
  minWithdrawal: number;
  enableAds: boolean;
  adFrequency: number; // minutes between ads
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  active: boolean;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<AdminSettings>({
    exchangeRate: 0.1,
    minWithdrawal: 100,
    enableAds: true,
    adFrequency: 5,
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: 500,
    difficulty: "medium" as "easy" | "medium" | "hard",
    type: "mining" as Task["type"],
    timeframe: 4,
    socialLink: "",
    youtubeUrl: "",
    articleUrl: "",
    twitterHandle: "",
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalTasks: 0,
    totalUsers: 0,
    totalTokensDistributed: 0,
    avgTaskReward: 0,
    pendingWithdrawals: 0,
  });
  const [activeTab, setActiveTab] = useState<
    "tasks" | "users" | "withdrawals" | "announcements" | "settings"
  >("tasks");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Check admin authentication
    const authenticated = localStorage.getItem("adminAuthenticated") === "true";
    if (!authenticated) {
      window.location.href = "/sageadmin";
      return;
    }
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    // Load tasks from localStorage
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
    }

    // Load settings
    const settingsStr = localStorage.getItem("adminSettings");
    if (settingsStr) {
      try {
        setSettings(JSON.parse(settingsStr));
      } catch {
        // Keep default settings
      }
    }

    // Load announcements
    const announcementsStr = localStorage.getItem("adminAnnouncements");
    if (announcementsStr) {
      try {
        setAnnouncements(JSON.parse(announcementsStr));
      } catch {
        setAnnouncements([]);
      }
    }

    loadAllUsers();
    loadAllWithdrawals();
  }, []);

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    localStorage.setItem("adminTasks", JSON.stringify(tasks));
    calculateStats();
  }, [tasks]);

  useEffect(() => {
    calculateStats();
  }, [users, withdrawals]);

  const loadAllUsers = () => {
    const allUsers: UserProfile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("user_profile_")) {
        try {
          const userStr = localStorage.getItem(key);
          if (userStr) {
            const user = JSON.parse(userStr);
            allUsers.push(user);
          }
        } catch {
          // Skip invalid entries
        }
      }
    }
    setUsers(allUsers);
  };

  const loadAllWithdrawals = () => {
    const allWithdrawals: WithdrawalRequest[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("withdrawals_")) {
        try {
          const withdrawalStr = localStorage.getItem(key);
          if (withdrawalStr) {
            const userWithdrawals = JSON.parse(withdrawalStr);
            allWithdrawals.push(...userWithdrawals);
          }
        } catch {
          // Skip invalid entries
        }
      }
    }
    setWithdrawals(allWithdrawals);
  };

  const calculateStats = () => {
    const totalReward = tasks.reduce((sum, t) => sum + t.reward, 0);
    const totalDistributed = users.reduce((sum, u) => sum + u.totalEarned, 0);
    const pendingCount = withdrawals.filter(
      (w) => w.status === "pending"
    ).length;

    setStats({
      totalTasks: tasks.length,
      totalUsers: users.length,
      totalTokensDistributed: totalDistributed,
      avgTaskReward:
        tasks.length > 0 ? Math.round(totalReward / tasks.length) : 0,
      pendingWithdrawals: pendingCount,
    });
  };

  const createUserNotification = (
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

  const handleAddOrUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert("Please fill in all fields");
      return;
    }

    const rewardValue = isNaN(formData.reward) ? 500 : formData.reward;

    if (editingId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingId ? { ...t, ...formData, reward: rewardValue } : t
        )
      );
      setEditingId(null);
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        reward: rewardValue,
        difficulty: formData.difficulty,
        type: formData.type,
        timeframe: formData.timeframe,
        completedBy: [],
        ...(formData.type === "social" && { socialLink: formData.socialLink }),
        ...(formData.type === "youtube" && { youtubeUrl: formData.youtubeUrl }),
        ...(formData.type === "article" && { articleUrl: formData.articleUrl }),
        ...(formData.type === "twitter" && {
          twitterHandle: formData.twitterHandle,
        }),
      };
      setTasks((prev) => [...prev, newTask]);

      users.forEach((user) => {
        createUserNotification(
          user.email,
          "task",
          "New Task Available",
          `A new task "${formData.title}" is now available. Reward: ${rewardValue} ST`
        );
      });
    }

    setFormData({
      title: "",
      description: "",
      reward: 500,
      difficulty: "medium",
      type: "mining",
      timeframe: 4,
      socialLink: "",
      youtubeUrl: "",
      articleUrl: "",
      twitterHandle: "",
    });
  };

  const handleEditTask = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      reward: task.reward,
      difficulty: task.difficulty,
      type: task.type,
      timeframe: task.timeframe || 4,
      socialLink: task.socialLink || "",
      youtubeUrl: task.youtubeUrl || "",
      articleUrl: task.articleUrl || "",
      twitterHandle: task.twitterHandle || "",
    });
    setEditingId(task.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      reward: 500,
      difficulty: "medium",
      type: "mining",
      timeframe: 4,
      socialLink: "",
      youtubeUrl: "",
      articleUrl: "",
      twitterHandle: "",
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateUserTokens = (email: string, newBalance: number) => {
    if (isNaN(newBalance) || newBalance < 0) {
      alert("Please enter a valid token amount");
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.email === email
          ? { ...u, tokenBalance: newBalance, totalEarned: newBalance }
          : u
      )
    );

    // Update in localStorage - main user object
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      if (currentUser.email === email) {
        currentUser.tokenBalance = newBalance;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    }

    // Update in allUsers list
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const userIndex = allUsers.findIndex((u: any) => u.email === email);
    if (userIndex !== -1) {
      allUsers[userIndex].tokenBalance = newBalance;
      allUsers[userIndex].totalEarned = newBalance;
      localStorage.setItem("allUsers", JSON.stringify(allUsers));
    }

    // Update in user_profile
    localStorage.setItem(
      `user_profile_${email}`,
      JSON.stringify({ tokenBalance: newBalance })
    );
  };

  const deleteUser = (email: string) => {
    setUsers((prev) => prev.filter((u) => u.email !== email));
    localStorage.removeItem(`user_profile_${email}`);
    localStorage.removeItem(`user_${email}_profile`);
    setSelectedUser(null);
  };

  const processWithdrawal = (withdrawalId: string) => {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === withdrawalId ? { ...w, status: "completed" } : w
      )
    );

    // Update withdrawal in localStorage
    withdrawals.forEach((w) => {
      if (w.id === withdrawalId) {
        const userWithdrawals = JSON.parse(
          localStorage.getItem(`withdrawals_${w.email}`) || "[]"
        );
        const updatedWithdrawals = userWithdrawals.map(
          (wd: WithdrawalRequest) =>
            wd.id === withdrawalId ? { ...wd, status: "completed" } : wd
        );
        localStorage.setItem(
          `withdrawals_${w.email}`,
          JSON.stringify(updatedWithdrawals)
        );

        createUserNotification(
          w.email,
          "withdrawal",
          "Withdrawal Approved",
          `Your withdrawal request of ${w.amount} ST has been approved and will be sent to your wallet shortly.`
        );

        console.log(
          `[EMAIL SENT] To: ${w.email}, Subject: Withdrawal Approved, Amount: ${w.amount} ST, Wallet: ${w.walletId}`
        );
      }
    });
  };

  const handleChangeAdminPassword = () => {
    const currentAdminPassword =
      localStorage.getItem("adminPassword") || "SageAdmin2025!";

    if (currentPassword !== currentAdminPassword) {
      alert("Current password is incorrect");
      return;
    }

    if (newPassword.length < 8) {
      alert("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    localStorage.setItem("adminPassword", newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    alert("Admin password changed successfully!");
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Verifying admin access...</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <Zap className="w-8 h-8 text-accent" /> */}
            <img src="./sage.jpeg" alt="logo" className="w-8 h-8" />
            <span className="text-2xl font-bold">Admin Panel</span>
          </div>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Tasks
                </p>
                <p className="text-3xl font-bold">{stats.totalTasks}</p>
              </div>
              <CpuIcon className="w-8 h-8 text-accent opacity-20" />
            </div>
          </Card>
          <Card className="border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Active Users
                </p>
                <p className="text-3xl font-bold text-accent">
                  {stats.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-accent opacity-20" />
            </div>
          </Card>
          <Card className="border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Tokens Distributed
                </p>
                <p className="text-3xl font-bold text-accent">
                  {stats.totalTokensDistributed}
                </p>
              </div>
              <Award className="w-8 h-8 text-accent opacity-20" />
            </div>
          </Card>
          <Card className="border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Avg Task Reward
                </p>
                <p className="text-3xl font-bold">{stats.avgTaskReward}</p>
                <p className="text-xs text-muted-foreground mt-1">ST</p>
              </div>
              <BarChart3 className="w-8 h-8 text-accent opacity-20" />
            </div>
          </Card>
          <Card className="border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Pending Withdrawals
                </p>
                <p className="text-3xl font-bold text-orange-400">
                  {stats.pendingWithdrawals}
                </p>
              </div>
              <Send className="w-8 h-8 text-orange-400 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border flex-wrap">
          <Button
            onClick={() => setActiveTab("tasks")}
            variant={activeTab === "tasks" ? "default" : "ghost"}
            className={
              activeTab === "tasks" ? "bg-accent text-accent-foreground" : ""
            }
          >
            <CpuIcon className="w-4 h-4 mr-2" />
            Tasks
          </Button>
          <Button
            onClick={() => setActiveTab("users")}
            variant={activeTab === "users" ? "default" : "ghost"}
            className={
              activeTab === "users" ? "bg-accent text-accent-foreground" : ""
            }
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button
            onClick={() => setActiveTab("withdrawals")}
            variant={activeTab === "withdrawals" ? "default" : "ghost"}
            className={
              activeTab === "withdrawals"
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <Send className="w-4 h-4 mr-2" />
            Withdrawals
          </Button>
          <Button
            onClick={() => setActiveTab("announcements")}
            variant={activeTab === "announcements" ? "default" : "ghost"}
            className={
              activeTab === "announcements"
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <Bell className="w-4 h-4 mr-2" />
            Announcements
          </Button>
          <Button
            onClick={() => setActiveTab("settings")}
            variant={activeTab === "settings" ? "default" : "ghost"}
            className={
              activeTab === "settings" ? "bg-accent text-accent-foreground" : ""
            }
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <>
            {/* Create/Edit Task Form */}
            <Card className="border-border bg-card mb-8 p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? "Edit Task" : "Create New Task"}
              </h2>

              <form onSubmit={handleAddOrUpdateTask} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Task Title
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g., Data Validation"
                    className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the task"
                    className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Reward (ST)
                    </label>
                    <Input
                      type="number"
                      value={String(formData.reward)}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? 0
                            : Number.parseInt(e.target.value);
                        const parsedValue = isNaN(value) ? 500 : value;
                        setFormData((prev) => ({
                          ...prev,
                          reward: parsedValue,
                        }));
                      }}
                      min="1"
                      step="10"
                      className="mt-2 bg-input border-border text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          difficulty: e.target.value as
                            | "easy"
                            | "medium"
                            | "hard",
                        }))
                      }
                      className="mt-2 w-full bg-input border border-border text-foreground rounded px-3 py-2"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Task Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: e.target.value as Task["type"],
                        }))
                      }
                      className="mt-2 w-full bg-input border border-border text-foreground rounded px-3 py-2"
                    >
                      <option value="mining">Mining Session</option>
                      <option value="social">Social Media</option>
                      <option value="youtube">YouTube</option>
                      <option value="article">Article</option>
                      <option value="twitter">Twitter</option>
                      <option value="admob">AdMob</option>
                    </select>
                  </div>

                  {formData.type === "mining" && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Timeframe (minutes)
                      </label>
                      <Input
                        type="number"
                        value={String(formData.timeframe)}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value) || 4;
                          setFormData((prev) => ({
                            ...prev,
                            timeframe: value,
                          }));
                        }}
                        min="1"
                        className="mt-2 bg-input border-border text-foreground"
                      />
                    </div>
                  )}

                  {formData.type === "social" && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Social Link
                      </label>
                      <Input
                        type="url"
                        value={formData.socialLink}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            socialLink: e.target.value,
                          }))
                        }
                        placeholder="https://..."
                        className="mt-2 bg-input border-border text-foreground"
                      />
                    </div>
                  )}

                  {formData.type === "youtube" && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        YouTube URL
                      </label>
                      <Input
                        type="url"
                        value={formData.youtubeUrl}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            youtubeUrl: e.target.value,
                          }))
                        }
                        placeholder="https://youtube.com/..."
                        className="mt-2 bg-input border-border text-foreground"
                      />
                    </div>
                  )}

                  {formData.type === "article" && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Article URL
                      </label>
                      <Input
                        type="url"
                        value={formData.articleUrl}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            articleUrl: e.target.value,
                          }))
                        }
                        placeholder="https://..."
                        className="mt-2 bg-input border-border text-foreground"
                      />
                    </div>
                  )}

                  {formData.type === "twitter" && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Twitter Handle
                      </label>
                      <Input
                        type="text"
                        value={formData.twitterHandle}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            twitterHandle: e.target.value,
                          }))
                        }
                        placeholder="@username"
                        className="mt-2 bg-input border-border text-foreground"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {editingId ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <CpuIcon className="w-4 h-4 mr-2" />
                        Create Task
                      </>
                    )}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="flex-1 border-border bg-transparent"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {/* Task List */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Active Tasks ({tasks.length})
              </h2>

              {tasks.length === 0 ? (
                <Card className="border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">No tasks created yet.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card key={task.id} className="border-border bg-card p-6">
                      <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold">{task.title}</h3>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                task.difficulty === "easy"
                                  ? "bg-green-500/20 text-green-400"
                                  : task.difficulty === "medium"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {task.difficulty === "easy"
                                ? "Easy"
                                : task.difficulty === "medium"
                                ? "Medium"
                                : "Hard"}
                            </span>
                            <span
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
                            </span>
                          </div>
                          <p className="text-muted-foreground mb-4">
                            {task.description}
                          </p>
                          <div className="flex gap-8">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Reward
                              </p>
                              <p className="font-semibold text-accent text-lg">
                                {task.reward} ST
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditTask(task)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Platform Users ({users.length})
            </h2>

            {users.length === 0 ? (
              <Card className="border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  No users registered yet.
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {users.map((user) => (
                  <Card
                    key={user.email}
                    className="border-border bg-card p-6 hover:border-accent/50 transition-colors"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{user.fullName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setSelectedUser(
                              selectedUser?.email === user.email ? null : user
                            )
                          }
                          className="text-accent"
                        >
                          {selectedUser?.email === user.email ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2 py-4 border-y border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Token Balance
                          </span>
                          <span className="font-bold text-accent">
                            {user.tokenBalance} ST
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Tasks Completed
                          </span>
                          <span className="font-bold">
                            {user.tasksCompleted}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Total Earned
                          </span>
                          <span className="font-bold text-accent">
                            {user.totalEarned} ST
                          </span>
                        </div>
                      </div>

                      {selectedUser?.email === user.email && (
                        <div className="space-y-3 pt-4">
                          <div>
                            <label className="text-sm font-medium text-foreground">
                              Adjust Tokens
                            </label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                type="number"
                                id={`tokens_${user.email}`}
                                placeholder="New balance"
                                defaultValue={
                                  isNaN(user.tokenBalance)
                                    ? ""
                                    : String(user.tokenBalance)
                                }
                                className="bg-input border-border text-foreground flex-1"
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  const input = document.getElementById(
                                    `tokens_${user.email}`
                                  ) as HTMLInputElement;
                                  if (input.value) {
                                    const parsedValue = Number.parseInt(
                                      input.value
                                    );
                                    if (!isNaN(parsedValue)) {
                                      updateUserTokens(user.email, parsedValue);
                                    } else {
                                      alert("Please enter a valid number");
                                    }
                                  }
                                }}
                                className="bg-accent text-accent-foreground hover:bg-accent/90"
                              >
                                Update
                              </Button>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => deleteUser(user.email)}
                            variant="outline"
                            className="w-full border-destructive text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === "withdrawals" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Withdrawal Requests</h2>

            {withdrawals.length === 0 ? (
              <Card className="border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">No withdrawal requests.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((wd) => (
                  <Card key={wd.id} className="border-border bg-card p-6">
                    <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold">
                              {wd.amount} ST
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {wd.email}
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              wd.status === "completed"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {wd.status === "completed"
                              ? "Completed"
                              : "Pending"}
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            <span className="font-mono">{wd.walletId}</span>
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(wd.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {wd.status === "pending" && (
                        <Button
                          onClick={() => processWithdrawal(wd.id)}
                          className="bg-green-500/90 text-green-50 hover:bg-green-600"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Announcements</h2>

            {/* Create Announcement Form */}
            <Card className="border-border bg-card mb-8 p-6">
              <h3 className="text-xl font-bold mb-4">
                Create New Announcement
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!announcementForm.title || !announcementForm.message) {
                    alert("Please fill in all fields");
                    return;
                  }

                  const newAnnouncement: Announcement = {
                    id: Date.now().toString(),
                    title: announcementForm.title,
                    message: announcementForm.message,
                    timestamp: Date.now(),
                    active: true,
                  };

                  const updatedAnnouncements = [
                    ...announcements,
                    newAnnouncement,
                  ];
                  setAnnouncements(updatedAnnouncements);
                  localStorage.setItem(
                    "adminAnnouncements",
                    JSON.stringify(updatedAnnouncements)
                  );

                  setAnnouncementForm({ title: "", message: "" });

                  // Notify all users
                  users.forEach((user) => {
                    createUserNotification(
                      user.email,
                      "admin",
                      announcementForm.title,
                      announcementForm.message
                    );
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Title
                  </label>
                  <Input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) =>
                      setAnnouncementForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Announcement title"
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Message
                  </label>
                  <textarea
                    value={announcementForm.message}
                    onChange={(e) =>
                      setAnnouncementForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Announcement message"
                    className="mt-2 w-full bg-input border border-border text-foreground rounded px-3 py-2 min-h-20"
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Create Announcement
                </Button>
              </form>
            </Card>

            {/* Announcements List */}
            <div>
              <h3 className="text-xl font-bold mb-4">
                Active Announcements ({announcements.length})
              </h3>

              {announcements.length === 0 ? (
                <Card className="border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">
                    No announcements created yet.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <Card
                      key={announcement.id}
                      className="border-border bg-card p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold">
                              {announcement.title}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                announcement.active
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {announcement.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-muted-foreground mb-4">
                            {announcement.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created:{" "}
                            {new Date(announcement.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const updated = announcements.map((a) =>
                                a.id === announcement.id
                                  ? { ...a, active: !a.active }
                                  : a
                              );
                              setAnnouncements(updated);
                              localStorage.setItem(
                                "adminAnnouncements",
                                JSON.stringify(updated)
                              );
                            }}
                            variant="outline"
                            className="border-border"
                          >
                            {announcement.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              const updated = announcements.filter(
                                (a) => a.id !== announcement.id
                              );
                              setAnnouncements(updated);
                              localStorage.setItem(
                                "adminAnnouncements",
                                JSON.stringify(updated)
                              );
                            }}
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">System Settings</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Exchange Rate Settings */}
              <Card className="border-border bg-card p-6">
                <h3 className="text-lg font-bold mb-4">Exchange Rate</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      ST to USD Rate
                    </label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.exchangeRate}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0.1;
                          setSettings((prev) => ({
                            ...prev,
                            exchangeRate: value,
                          }));
                        }}
                        className="bg-input border-border text-foreground"
                      />
                      <Button
                        onClick={() => {
                          localStorage.setItem(
                            "adminSettings",
                            JSON.stringify(settings)
                          );
                          alert("Exchange rate updated!");
                        }}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: 1 ST = ${settings.exchangeRate} USD
                    </p>
                  </div>
                </div>
              </Card>

              {/* Withdrawal Settings */}
              <Card className="border-border bg-card p-6">
                <h3 className="text-lg font-bold mb-4">Withdrawal Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Minimum Withdrawal (ST)
                    </label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="number"
                        min="1"
                        value={settings.minWithdrawal}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 100;
                          setSettings((prev) => ({
                            ...prev,
                            minWithdrawal: value,
                          }));
                        }}
                        className="bg-input border-border text-foreground"
                      />
                      <Button
                        onClick={() => {
                          localStorage.setItem(
                            "adminSettings",
                            JSON.stringify(settings)
                          );
                          alert("Minimum withdrawal updated!");
                        }}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Users must have at least {settings.minWithdrawal} ST to
                      withdraw
                    </p>
                  </div>
                </div>
              </Card>

              {/* AdMob Settings */}
              <Card className="border-border bg-card p-6">
                <h3 className="text-lg font-bold mb-4">AdMob Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Enable Ads on App Launch
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Show AdMob ads when users open the app
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableAds}
                      onChange={(e) => {
                        setSettings((prev) => ({
                          ...prev,
                          enableAds: e.target.checked,
                        }));
                      }}
                      className="w-4 h-4"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Ad Frequency (minutes)
                    </label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="number"
                        min="1"
                        value={settings.adFrequency}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 5;
                          setSettings((prev) => ({
                            ...prev,
                            adFrequency: value,
                          }));
                        }}
                        className="bg-input border-border text-foreground"
                      />
                      <Button
                        onClick={() => {
                          localStorage.setItem(
                            "adminSettings",
                            JSON.stringify(settings)
                          );
                          alert("AdMob settings updated!");
                        }}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ads shown every {settings.adFrequency} minutes during
                      mining sessions
                    </p>
                  </div>
                </div>
              </Card>

              {/* Admin Password Change */}
              <Card className="border-border bg-card p-6">
                <h3 className="text-lg font-bold mb-4">
                  Change Admin Password
                </h3>
                <div className="space-y-4">
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
                    onClick={handleChangeAdminPassword}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Change Password
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
