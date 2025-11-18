/**
 * Sync status indicator component
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { syncPendingData, checkOnlineStatus } from '../store/syncSlice';

export const SyncStatus: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOnline, isSyncing, pendingCount, lastSyncTime, syncError } = useAppSelector(
    (state) => state.sync
  );

  useEffect(() => {
    // Check online status periodically
    const interval = setInterval(() => {
      dispatch(checkOnlineStatus());
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleSyncPress = () => {
    if (!isSyncing && isOnline && pendingCount > 0) {
      dispatch(syncPendingData());
    }
  };

  if (!isOnline) {
    return (
      <View style={styles.container}>
        <View style={[styles.indicator, styles.offline]} />
        <Text style={styles.text}>Offline Mode</Text>
        {pendingCount > 0 && (
          <Text style={styles.pendingText}>
            {pendingCount} item{pendingCount !== 1 ? 's' : ''} pending
          </Text>
        )}
      </View>
    );
  }

  if (isSyncing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.text}>Syncing...</Text>
      </View>
    );
  }

  if (pendingCount > 0) {
    return (
      <TouchableOpacity style={styles.container} onPress={handleSyncPress}>
        <View style={[styles.indicator, styles.pending]} />
        <Text style={styles.text}>
          {pendingCount} item{pendingCount !== 1 ? 's' : ''} to sync
        </Text>
        <Text style={styles.tapText}>Tap to sync</Text>
      </TouchableOpacity>
    );
  }

  if (syncError) {
    return (
      <TouchableOpacity style={styles.container} onPress={handleSyncPress}>
        <View style={[styles.indicator, styles.error]} />
        <Text style={styles.errorText}>Sync failed</Text>
        <Text style={styles.tapText}>Tap to retry</Text>
      </TouchableOpacity>
    );
  }

  if (lastSyncTime) {
    const syncDate = new Date(lastSyncTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / 60000);
    
    let timeText = 'Just now';
    if (diffMinutes > 60) {
      timeText = `${Math.floor(diffMinutes / 60)}h ago`;
    } else if (diffMinutes > 0) {
      timeText = `${diffMinutes}m ago`;
    }

    return (
      <View style={styles.container}>
        <View style={[styles.indicator, styles.synced]} />
        <Text style={styles.text}>Synced {timeText}</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  offline: {
    backgroundColor: '#9E9E9E',
  },
  pending: {
    backgroundColor: '#FF9800',
  },
  synced: {
    backgroundColor: '#4CAF50',
  },
  error: {
    backgroundColor: '#F44336',
  },
  text: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  pendingText: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
    marginRight: 4,
  },
  tapText: {
    fontSize: 11,
    color: '#2196F3',
    fontStyle: 'italic',
  },
});
