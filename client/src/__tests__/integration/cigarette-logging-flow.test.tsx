import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { HomeScreen } from '../../screens/HomeScreen';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Cigarette Logging Flow Integration Test', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: { id: '123', email: 'test@example.com' },
        token: 'test-token',
        isLoading: false,
        error: null,
      },
      cigLog: {
        todayStats: {
          totalToday: 5,
          dailyTarget: 10,
          remaining: 5,
          exceeded: false,
          overageCount: 0,
        },
        todayLogs: [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            count: 2,
            location: 'Home',
            trigger: 'stress',
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            count: 3,
            location: 'Work',
          },
        ],
        isLoading: false,
        error: null,
      },
      stats: {
        savings: {
          data: {
            totalSaved: 50.25,
            cigarettesSaved: 100,
            costPerCigarette: 0.50,
            daysSinceStart: 10,
            breakdown: {
              today: 2.50,
              thisWeek: 15.00,
              thisMonth: 50.25,
            },
            projections: {
              nextWeek: 17.50,
              nextMonth: 75.00,
              nextYear: 900.00,
            },
          },
          isLoading: false,
          error: null,
        },
        progress: {
          data: [],
          summary: null,
          isLoading: false,
          error: null,
        },
      },
      achievements: {
        earned: [
          {
            type: 'first_day',
            title: 'First Day Complete!',
            description: 'You made it through your first day',
            category: 'streak',
            icon: '🌟',
            earned: true,
            progress: 100,
            earnedAt: new Date().toISOString(),
          },
        ],
        upcoming: [],
        stats: {
          totalEarned: 1,
          totalAvailable: 10,
          currentStreak: 5,
          moneySaved: 50.25,
        },
        recentAchievements: [],
        punishmentStatus: null,
        loading: false,
        error: null,
      },
      sync: {
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: null,
        syncError: null,
        syncSuccess: false,
      },
      notifications: {
        preferences: {
          dailyReminders: true,
          achievementAlerts: true,
          cravingSupport: true,
          targetWarnings: true,
          reminderTime: '09:00',
        },
        hasPermission: true,
        isLoading: false,
        error: null,
      },
    });
  });

  it('should display current consumption stats', () => {
    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    );

    // Should show today's count
    expect(getByText(/5.*10/)).toBeTruthy(); // "5 / 10" format

    // Should show remaining
    expect(getByText(/5.*remaining/i)).toBeTruthy();
  });

  it('should display today\'s logs', () => {
    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    );

    // Should show log entries
    expect(getByText(/2 cigarette/i)).toBeTruthy();
    expect(getByText(/3 cigarette/i)).toBeTruthy();
    expect(getByText(/Home/i)).toBeTruthy();
    expect(getByText(/Work/i)).toBeTruthy();
  });

  it('should open quick log modal when button is pressed', () => {
    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    );

    const quickLogButton = getByText(/Log Cigarette/i);
    fireEvent.press(quickLogButton);

    // Modal should open
    expect(getByText(/How many cigarettes/i)).toBeTruthy();
  });

  it('should show SOS button for craving support', () => {
    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    );

    expect(getByText(/Need Help with Cravings/i)).toBeTruthy();
  });

  it('should open SOS modal when SOS button is pressed', () => {
    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    );

    const sosButton = getByText(/Need Help with Cravings/i);
    fireEvent.press(sosButton);

    // SOS modal should open
    expect(getByText(/Craving Support/i)).toBeTruthy();
  });

  it('should display recent achievements', () => {
    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    );

    expect(getByText(/Recent Achievements/i)).toBeTruthy();
    expect(getByText(/First Day Complete/i)).toBeTruthy();
  });

  it('should show warning when approaching daily limit', () => {
    const storeNearLimit = mockStore({
      ...store.getState(),
      cigLog: {
        ...store.getState().cigLog,
        todayStats: {
          totalToday: 9,
          dailyTarget: 10,
          remaining: 1,
          exceeded: false,
          overageCount: 0,
        },
      },
    });

    const { getByText } = render(
      <Provider store={storeNearLimit}>
        <HomeScreen />
      </Provider>
    );

    // Should show only 1 remaining
    expect(getByText(/1.*remaining/i)).toBeTruthy();
  });

  it('should show exceeded status when over limit', () => {
    const storeExceeded = mockStore({
      ...store.getState(),
      cigLog: {
        ...store.getState().cigLog,
        todayStats: {
          totalToday: 12,
          dailyTarget: 10,
          remaining: 0,
          exceeded: true,
          overageCount: 2,
        },
      },
    });

    const { getByText } = render(
      <Provider store={storeExceeded}>
        <HomeScreen />
      </Provider>
    );

    // Should show over target message
    expect(getByText(/Over target by 2/i)).toBeTruthy();
  });
});
