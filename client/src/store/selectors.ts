import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

// Memoized selectors to prevent unnecessary re-renders

// Auth selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;

// Plan selectors
export const selectQuitPlan = (state: RootState) => state.plan.quitPlan;
export const selectDailyTarget = createSelector(
  [selectQuitPlan],
  (quitPlan) => quitPlan?.currentDailyLimit ?? 0
);

// Cigarette log selectors
export const selectTodayCount = (state: RootState) => state.cigLog.todayCount;
export const selectCigLogs = (state: RootState) => state.cigLog.logs;
export const selectRemainingToday = createSelector(
  [selectDailyTarget, selectTodayCount],
  (target, count) => Math.max(0, target - count)
);

// Stats selectors
export const selectProgressData = (state: RootState) => state.stats.progressData;
export const selectSavings = (state: RootState) => state.stats.savings;
export const selectCurrentStreak = (state: RootState) => state.stats.currentStreak;

// Achievements selectors
export const selectEarnedAchievements = (state: RootState) => state.achievements.earned;
export const selectUpcomingAchievements = (state: RootState) => state.achievements.upcoming;
export const selectAchievementStats = createSelector(
  [selectEarnedAchievements, selectUpcomingAchievements, selectSavings, selectCurrentStreak],
  (earned, upcoming, savings, streak) => ({
    totalEarned: earned.length,
    totalAvailable: earned.length + upcoming.length,
    currentStreak: streak,
    moneySaved: savings.total,
  })
);

// Journal selectors
export const selectJournalEntries = (state: RootState) => state.journal.entries;
export const selectTodayMood = createSelector(
  [selectJournalEntries],
  (entries) => {
    const today = new Date().toISOString().split('T')[0];
    return entries.find(entry => entry.date.startsWith(today));
  }
);

// Sync selectors
export const selectSyncStatus = (state: RootState) => state.sync.status;
export const selectLastSyncTime = (state: RootState) => state.sync.lastSyncTime;
export const selectPendingChanges = (state: RootState) => state.sync.pendingChanges;

// Notification selectors
export const selectNotificationSettings = (state: RootState) => state.notifications.settings;
export const selectNotificationsEnabled = (state: RootState) => 
  state.notifications.settings.enabled;
