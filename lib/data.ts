// Shared data store for demo purposes
// In production, this would be a database

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  walletId: string;
  tokenBalance: number;
  tasksCompleted: number;
  totalEarned: number;
  joinedDate: string;
  referralCode: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'mining' | 'social' | 'youtube' | 'article' | 'twitter' | 'admob';
  timeframe?: number;
  completedBy: string[];
  socialLink?: string;
  youtubeUrl?: string;
  articleUrl?: string;
  twitterHandle?: string;
  createdAt: string;
}

export interface MiningSession {
  id: string;
  userId: string;
  taskId: string;
  startTime: string;
  endTime: string;
  reward: number;
  isActive: boolean;
  boosted: boolean;
}

export interface Withdrawal {
  id: string;
  email: string;
  amount: number;
  walletId: string;
  status: 'pending' | 'completed';
  timestamp: number;
}

export interface Referral {
  id: string;
  referrerId: string;
  referrerEmail: string;
  referredEmail: string;
  referredName: string;
  status: 'pending' | 'completed';
  rewardAmount: number;
  timestamp: number;
}

export interface Notification {
  id: string;
  type: 'task' | 'withdrawal' | 'referral' | 'admin';
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  email?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  active: boolean;
}

// Initialize with demo data
export const initialUsers: User[] = [
  {
    id: '1',
    fullName: 'Demo User',
    email: 'demo@example.com',
    password: 'password123',
    walletId: '0x742d35Cc6634C0532925a3b844Bc9e7595f1a',
    tokenBalance: 1250,
    tasksCompleted: 5,
    totalEarned: 2500,
    joinedDate: new Date().toISOString(),
    referralCode: 'SAGE-DEMO123'
  }
];

export const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Data Validation',
    description: 'Validate and clean dataset',
    reward: 500,
    difficulty: 'easy',
    type: 'mining',
    timeframe: 4,
    completedBy: [],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Content Review',
    description: 'Review and categorize content',
    reward: 350,
    difficulty: 'medium',
    type: 'mining',
    timeframe: 4,
    completedBy: [],
    createdAt: new Date().toISOString()
  }
];

// Global data store (in production, use a database)
export let users: User[] = [...initialUsers];
export let tasks: Task[] = [...initialTasks];
export let miningSessions: MiningSession[] = [];
export let withdrawals: Withdrawal[] = [];
export let referrals: Referral[] = [];
export let notifications: Notification[] = [];
export let announcements: Announcement[] = [];

// Admin settings
export let adminSettings = {
  exchangeRate: 0.1,
  minWithdrawal: 100,
  enableAds: true,
  adFrequency: 5
};

// Helper functions
export function resetData() {
  users = [...initialUsers];
  tasks = [...initialTasks];
  miningSessions = [];
  withdrawals = [];
  referrals = [];
  notifications = [];
  announcements = [];
  adminSettings = {
    exchangeRate: 0.1,
    minWithdrawal: 100,
    enableAds: true,
    adFrequency: 5
  };
}