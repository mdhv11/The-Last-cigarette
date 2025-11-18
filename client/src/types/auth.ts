export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin?: string;
  quitPlan?: QuitPlan;
  settings?: UserSettings;
}

export interface QuitPlan {
  startDate: string;
  quitDate: string;
  initialDailyAmount: number;
  reductionMethod: "gradual" | "cold_turkey";
  cigaretteCost: number;
  packSize: number;
}

export interface UserSettings {
  notifications: {
    dailyReminders: boolean;
    achievementAlerts: boolean;
    cravingSupport: boolean;
  };
  punishments: {
    enabled: boolean;
    donationAmount: number;
    charityName: string;
  };
  rewards: Array<{
    name: string;
    cost: number;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
