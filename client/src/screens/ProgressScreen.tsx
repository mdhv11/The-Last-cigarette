import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProgress, fetchSavings, clearStatsError } from '../store/statsSlice';
import { fetchAchievements } from '../store/achievementsSlice';
import { ConsumptionChart } from '../components/ConsumptionChart';
import { SavingsDisplay } from '../components/SavingsDisplay';
import { AchievementsList } from '../components/AchievementsList';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { LoadingState } from '../components/LoadingState';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';

export const ProgressScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { progress, savings } = useAppSelector((state) => state.stats);
  const { earned, upcoming, stats: achievementStats, loading: achievementsLoading } = useAppSelector(
    (state) => state.achievements
  );
  const [refreshing, setRefreshing] = React.useState(false);
  const { toastState, showError, showSuccess, hideToast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        dispatch(fetchProgress(30)).unwrap(),
        dispatch(fetchSavings()).unwrap(),
        dispatch(fetchAchievements()).unwrap(),
      ]);
    } catch (error: any) {
      showError(error.message || 'Failed to load progress data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchProgress(30)).unwrap(),
        dispatch(fetchSavings()).unwrap(),
        dispatch(fetchAchievements()).unwrap(),
      ]);
      showSuccess('Progress updated successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    dispatch(clearStatsError());
    loadAllData();
  };

  const isLoading =
    progress.isLoading && savings.isLoading && achievementsLoading;

  const hasError = progress.error || savings.error;

  if (isLoading && !progress.data.length && !savings.data && earned.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading your progress..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Toast
        message={toastState.message}
        type={toastState.type}
        duration={toastState.duration}
        visible={toastState.visible}
        onDismiss={hideToast}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your journey to quit smoking</Text>
        </View>

        {hasError && (
          <ErrorDisplay
            error={progress.error || savings.error}
            onRetry={handleRetry}
            onDismiss={() => dispatch(clearStatsError())}
          />
        )}

        {progress.summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Overall Performance</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{progress.summary.totalDays}</Text>
                <Text style={styles.summaryLabel}>Days Tracked</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {progress.summary.daysUnderTarget}
                </Text>
                <Text style={styles.summaryLabel}>Days Under Target</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {progress.summary.averageActual.toFixed(1)}
                </Text>
                <Text style={styles.summaryLabel}>Avg Daily</Text>
              </View>
            </View>
            {progress.summary.overallPerformance > 0 && (
              <View style={styles.performanceContainer}>
                <Text style={styles.performanceText}>
                  🎉 You're {progress.summary.overallPerformance}% below your target!
                </Text>
              </View>
            )}
          </View>
        )}

        {progress.data.length > 0 && <ConsumptionChart data={progress.data} />}

        {savings.data && <SavingsDisplay data={savings.data} />}

        {(earned.length > 0 || upcoming.length > 0) && (
          <AchievementsList
            earned={earned}
            upcoming={upcoming}
            stats={achievementStats}
          />
        )}

        {!progress.data.length && !savings.data && earned.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Start logging cigarettes to see your progress!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  performanceContainer: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  performanceText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
