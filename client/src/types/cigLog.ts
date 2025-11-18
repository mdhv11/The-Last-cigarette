export type CigTrigger =
  | "stress"
  | "social"
  | "habit"
  | "boredom"
  | "alcohol"
  | "coffee"
  | "work"
  | "anxiety"
  | "other";

export const TRIGGER_LABELS: Record<CigTrigger, string> = {
  stress: "Stress",
  social: "Social",
  habit: "Habit",
  boredom: "Boredom",
  alcohol: "Alcohol",
  coffee: "Coffee",
  work: "Work",
  anxiety: "Anxiety",
  other: "Other",
};

export interface CigLogEntry {
  count: number;
  timestamp?: string;
  notes?: string;
  location?: string;
  trigger?: CigTrigger;
}

export interface CigLog {
  id: string;
  count: number;
  timestamp: string;
  notes?: string;
  location?: string;
  trigger?: CigTrigger;
}

export interface DailyStats {
  totalToday: number;
  dailyTarget: number;
  remaining: number;
  exceeded: boolean;
  overageCount: number;
  progressPercentage?: number;
}

export interface TodayResponse {
  date: string;
  dailyStats: DailyStats;
  logs: CigLog[];
}

export interface HistoryResponse {
  history: Array<{
    date: string;
    totalCount: number;
    logCount: number;
    dailyTarget: number;
    exceeded: boolean;
    remaining: number;
  }>;
  summary: {
    totalDays: number;
    totalCigarettes: number;
    averagePerDay: number;
  };
}

export interface CigLogState {
  todayStats: DailyStats | null;
  todayLogs: CigLog[];
  history: HistoryResponse["history"];
  isLoading: boolean;
  error: string | null;
}
