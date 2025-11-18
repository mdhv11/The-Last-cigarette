import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { getTodayStats } from '../store/cigLogSlice';
import { useAppDispatch, useAppSelector } from '../store';

export const ConsumptionTracker: React.FC = () => {
  const dispatch = useAppDispatch();
  const { todayStats, todayLogs, isLoading, error } = useAppSelector((state) => state.cigLog);

  useEffect(() => {
    dispatch(getTodayStats());
  }, [dispatch]);

  // Calculate all hooks BEFORE any early returns
  const progressPercentage = useMemo(() => {
    return todayStats?.dailyTarget && todayStats.dailyTarget > 0 
      ? Math.min(100, (todayStats.totalToday / todayStats.dailyTarget) * 100)
      : 0;
  }, [todayStats?.totalToday, todayStats?.dailyTarget]);

  const getProgressColor = useCallback(() => {
    if (!todayStats) return '#4CAF50';
    if (todayStats.exceeded) return '#FF6B6B';
    if (progressPercentage > 80) return '#FFA726';
    return '#4CAF50';
  }, [todayStats, progressPercentage]);

  const getStatusMessage = useCallback(() => {
    if (!todayStats) return '';
    if (todayStats.exceeded) {
      return `Over target by ${todayStats.overageCount}`;
    }
    if (todayStats.remaining === 0) {
      return 'Target reached!';
    }
    return `${todayStats.remaining} remaining`;
  }, [todayStats]);

  // Now handle early returns AFTER all hooks
  if (isLoading && !todayStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading today's progress...</Text>
      </View>
    );
  }

  if (error && !todayStats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!todayStats) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Today's Progress</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(100, progressPercentage)}%`,
                  backgroundColor: getProgressColor()
                }
              ]} 
            />
          </View>
          
          <View style={styles.progressStats}>
            <Text style={styles.progressText}>
              {todayStats.totalToday} / {todayStats.dailyTarget}
            </Text>
            <Text style={[styles.statusText, { color: getProgressColor() }]}>
              {getStatusMessage()}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{todayStats.totalToday}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{todayStats.dailyTarget}</Text>
            <Text style={styles.statLabel}>Target</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getProgressColor() }]}>
              {todayStats.remaining}
            </Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>
      </View>

      {todayLogs.length > 0 && (
        <View style={styles.logsCard}>
          <Text style={styles.cardTitle}>Today's Logs</Text>
          {todayLogs.map((log: any) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logHeader}>
                <Text style={styles.logCount}>{log.count} cigarette{log.count > 1 ? 's' : ''}</Text>
                <Text style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              
              {(log.location || log.trigger) && (
                <View style={styles.logDetails}>
                  {log.location && (
                    <Text style={styles.logDetail}>📍 {log.location}</Text>
                  )}
                  {log.trigger && (
                    <Text style={styles.logDetail}>🔥 {log.trigger}</Text>
                  )}
                </View>
              )}
              
              {log.notes && (
                <Text style={styles.logNotes}>{log.notes}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    margin: 16,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    padding: 20,
  },
  statsCard: {
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
  logsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logTime: {
    fontSize: 14,
    color: '#666',
  },
  logDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  logDetail: {
    fontSize: 14,
    color: '#666',
  },
  logNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
});