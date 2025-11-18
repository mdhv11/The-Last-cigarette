export interface QuitPlan {
  startDate: string;
  quitDate: string;
  initialDailyAmount: number;
  reductionMethod: "gradual" | "cold_turkey";
  cigaretteCost: number;
  packSize: number;
}

export interface QuitPlanSetup {
  startDate: string;
  quitDate: string;
  initialDailyAmount: number;
  reductionMethod: "gradual" | "cold_turkey";
  cigaretteCost: number;
  packSize?: number;
}

export interface QuitPlanProgress {
  currentDailyTarget: number;
  daysSinceStart: number;
  totalDays: number;
  progressPercentage: number;
}

export interface QuitPlanResponse {
  quitPlan: QuitPlan;
  progress?: QuitPlanProgress;
}

export interface PlanState {
  quitPlan: QuitPlan | null;
  progress: QuitPlanProgress | null;
  isLoading: boolean;
  error: string | null;
  hasSetupPlan: boolean;
}
