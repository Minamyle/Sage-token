// API Client for Sage Token Application
const API_BASE_URL = "https://sage-token-backend.onrender.com/";

// API Response Types
interface StartMiningResponse {
  session_id: number;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  token_reward_rate: number;
  boost_count: number;
}

interface BoostMiningResponse {
  boost_count: number;
  new_end_time: string;
}

interface CompleteMiningResponse {
  tokens_earned: number;
  new_balance: number;
}

interface ActiveMiningSessionResponse {
  is_active: boolean;
  mining_circle_id?: number;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  token_reward_rate?: number;
}

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

interface CompleteTaskResponse {
  reward_claimed: number;
  new_balance: number;
}

interface ReferralStatsResponse {
  referral_code: string;
  total_rewards_earned: number;
  total_referrals: number;
  successful_referrals: number;
}

interface WithdrawalRequest {
  id: number;
  user_id: number;
  amount: number;
  wallet_address: string;
  status: "pending" | "completed" | "rejected";
  created_at: string;
  processed_at?: string;
}

interface NotificationResponse {
  id: string;
  type: "task" | "withdrawal" | "referral" | "admin";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication
  async register(data: {
    email: string;
    password: string;
    wallet_address: string;
    referral_code?: string;
    cookies_enabled: boolean;
    privacy_accepted: boolean;
  }) {
    const response = await this.request<{
      access_token: string;
      token_type: string;
      user: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.token = response.access_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token);
    }

    return response;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request<{
      access_token: string;
      token_type: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.token = response.access_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async adminLogin(data: { username: string; password: string }) {
    const response = await this.request<{
      access_token: string;
      token_type: string;
      admin: any;
    }>('/auth/sageadmin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.token = response.access_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_access_token', response.access_token);
    }

    return response;
  }

  async getCurrentAdmin() {
    return this.request('/auth/sageadmin/me');
  }

  // Mining
  async getActiveMiningSession(): Promise<ActiveMiningSessionResponse> {
    return this.request<ActiveMiningSessionResponse>('/mining/active-session');
  }

  async startMining(): Promise<StartMiningResponse> {
    return this.request<StartMiningResponse>('/mining/start', { method: 'POST' });
  }

  async completeMining(data: { session_id: number }): Promise<CompleteMiningResponse> {
    return this.request<CompleteMiningResponse>('/mining/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async boostMining(data: { session_id: number }): Promise<BoostMiningResponse> {
    return this.request<BoostMiningResponse>('/mining/boost', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Ads
  async completeBoost(data: { session_id: number }) {
    return this.request('/ads/boost-complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('/tasks');
  }

  async completeTask(data: { task_id: number }): Promise<CompleteTaskResponse> {
    return this.request<CompleteTaskResponse>('/tasks/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Referrals
  async getReferralStats(): Promise<ReferralStatsResponse> {
    return this.request<ReferralStatsResponse>('/referrals/stats');
  }

  // Withdrawals
  async requestWithdrawal(data: { amount: number; wallet_address: string }) {
    return this.request('/withdrawals/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWithdrawals(): Promise<WithdrawalRequest[]> {
    return this.request<WithdrawalRequest[]>('/withdrawals');
  }

  // Exchange Rates
  async getSageUsdRate() {
    return this.request('/rates/sage-usd');
  }

  // Notifications
  async getNotifications(params?: { unread_only?: boolean; limit?: number }): Promise<NotificationResponse[]> {
    const queryParams = new URLSearchParams();
    if (params?.unread_only !== undefined) {
      queryParams.append('unread_only', params.unread_only.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const query = queryParams.toString();
    return this.request<NotificationResponse[]>(`/notifications${query ? `?${query}` : ''}`);
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationRead(notificationId: number) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'POST' });
  }

  // Chat
  async sendMessage(data: { message: string }) {
    return this.request('/chat/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessages(params?: { limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const query = queryParams.toString();
    return this.request(`/chat${query ? `?${query}` : ''}`);
  }

  // Announcements
  async getAnnouncements() {
    return this.request('/announcements');
  }

  // Admin endpoints
  async getMiningCircles() {
    return this.request('/sageadmin/mining-circles');
  }

  async createMiningCircle(data: {
    start_time: string;
    end_time: string;
    token_reward_rate: number;
  }) {
    return this.request('/sageadmin/mining-circles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllTasks() {
    return this.request('/sageadmin/tasks');
  }

  async createTask(data: {
    title: string;
    description: string;
    task_type: string;
    reward_amount: number;
  }) {
    return this.request('/sageadmin/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllAnnouncements() {
    return this.request('/sageadmin/announcements');
  }

  async createAnnouncement(data: { title: string; content: string }) {
    return this.request('/sageadmin/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSettings() {
    return this.request('/sageadmin/settings');
  }

  async updateSettings(data: {
    referral_reward?: number;
    sage_usd_rate?: number;
    min_withdrawal_amount?: number;
  }) {
    return this.request('/sageadmin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAllUsers(params?: { limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const query = queryParams.toString();
    return this.request(`/sageadmin/users${query ? `?${query}` : ''}`);
  }

  async getAllWithdrawals(params?: { status?: string; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const query = queryParams.toString();
    return this.request(`/sageadmin/withdrawals${query ? `?${query}` : ''}`);
  }

  async updateWithdrawal(withdrawalId: number, data: {
    status: string;
    admin_notes?: string;
  }) {
    return this.request(`/sageadmin/withdrawals/${withdrawalId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAllChatMessages() {
    return this.request('/sageadmin/chat/messages');
  }

  async getUnrepliedMessages() {
    return this.request('/sageadmin/chat/unreplied');
  }

  async replyToMessage(data: { message_id: number; admin_reply: string }) {
    return this.request('/sageadmin/chat/reply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  setAdminToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_access_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('admin_access_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
