/**
 * Data synchronization service for offline support
 */
import { API_BASE_URL, buildAuthHeaders } from '../config/api';
import { saveToStorage, getFromStorage, STORAGE_KEYS } from './storage';

export interface PendingCigLog {
  id: string;
  timestamp: string;
  count: number;
  location?: string;
  trigger?: string;
}

export interface PendingJournalEntry {
  id: string;
  date: string;
  mood: string;
  cravingIntensity: number;
  notes?: string;
  triggers?: string[];
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

/**
 * Check if device is online
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    // Try to fetch from the API with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Add cigarette log to pending queue
 */
export const queueCigLog = async (log: PendingCigLog): Promise<void> => {
  try {
    const pending = await getFromStorage<PendingCigLog[]>(STORAGE_KEYS.PENDING_LOGS) || [];
    pending.push(log);
    await saveToStorage(STORAGE_KEYS.PENDING_LOGS, pending);
  } catch (error) {
    console.error('Error queuing cig log:', error);
    throw error;
  }
};

/**
 * Add journal entry to pending queue
 */
export const queueJournalEntry = async (entry: PendingJournalEntry): Promise<void> => {
  try {
    const pending = await getFromStorage<PendingJournalEntry[]>(STORAGE_KEYS.PENDING_JOURNAL) || [];
    pending.push(entry);
    await saveToStorage(STORAGE_KEYS.PENDING_JOURNAL, pending);
  } catch (error) {
    console.error('Error queuing journal entry:', error);
    throw error;
  }
};

/**
 * Sync pending cigarette logs
 */
const syncPendingCigLogs = async (token: string): Promise<SyncResult> => {
  const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };
  
  try {
    const pending = await getFromStorage<PendingCigLog[]>(STORAGE_KEYS.PENDING_LOGS) || [];
    
    if (pending.length === 0) {
      return result;
    }
    
    const remaining: PendingCigLog[] = [];
    
    for (const log of pending) {
      try {
        const response = await fetch(`${API_BASE_URL}/cigs/log`, {
          method: 'POST',
          headers: buildAuthHeaders(token),
          body: JSON.stringify({
            timestamp: log.timestamp,
            count: log.count,
            location: log.location,
            trigger: log.trigger,
          }),
        });
        
        if (response.ok) {
          result.synced++;
        } else {
          result.failed++;
          result.errors.push(`Failed to sync log ${log.id}`);
          remaining.push(log);
        }
      } catch (error) {
        result.failed++;
        result.errors.push(`Error syncing log ${log.id}: ${error}`);
        remaining.push(log);
      }
    }
    
    // Update pending queue with failed items
    await saveToStorage(STORAGE_KEYS.PENDING_LOGS, remaining);
    
    if (result.failed > 0) {
      result.success = false;
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Error syncing cig logs: ${error}`);
  }
  
  return result;
};

/**
 * Sync pending journal entries
 */
const syncPendingJournalEntries = async (token: string): Promise<SyncResult> => {
  const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };
  
  try {
    const pending = await getFromStorage<PendingJournalEntry[]>(STORAGE_KEYS.PENDING_JOURNAL) || [];
    
    if (pending.length === 0) {
      return result;
    }
    
    const remaining: PendingJournalEntry[] = [];
    
    for (const entry of pending) {
      try {
        const response = await fetch(`${API_BASE_URL}/journal/entry`, {
          method: 'POST',
          headers: buildAuthHeaders(token),
          body: JSON.stringify({
            date: entry.date,
            mood: entry.mood,
            cravingIntensity: entry.cravingIntensity,
            notes: entry.notes,
            triggers: entry.triggers,
          }),
        });
        
        if (response.ok) {
          result.synced++;
        } else {
          result.failed++;
          result.errors.push(`Failed to sync entry ${entry.id}`);
          remaining.push(entry);
        }
      } catch (error) {
        result.failed++;
        result.errors.push(`Error syncing entry ${entry.id}: ${error}`);
        remaining.push(entry);
      }
    }
    
    // Update pending queue with failed items
    await saveToStorage(STORAGE_KEYS.PENDING_JOURNAL, remaining);
    
    if (result.failed > 0) {
      result.success = false;
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Error syncing journal entries: ${error}`);
  }
  
  return result;
};

/**
 * Sync all pending data
 */
export const syncAllPendingData = async (token: string): Promise<SyncResult> => {
  const combinedResult: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };
  
  try {
    // Check if online first
    const online = await isOnline();
    if (!online) {
      combinedResult.success = false;
      combinedResult.errors.push('Device is offline');
      return combinedResult;
    }
    
    // Sync cigarette logs
    const cigLogsResult = await syncPendingCigLogs(token);
    combinedResult.synced += cigLogsResult.synced;
    combinedResult.failed += cigLogsResult.failed;
    combinedResult.errors.push(...cigLogsResult.errors);
    
    // Sync journal entries
    const journalResult = await syncPendingJournalEntries(token);
    combinedResult.synced += journalResult.synced;
    combinedResult.failed += journalResult.failed;
    combinedResult.errors.push(...journalResult.errors);
    
    // Update last sync timestamp
    if (combinedResult.synced > 0) {
      await saveToStorage(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    }
    
    combinedResult.success = combinedResult.failed === 0;
  } catch (error) {
    combinedResult.success = false;
    combinedResult.errors.push(`Sync error: ${error}`);
  }
  
  return combinedResult;
};

/**
 * Get pending items count
 */
export const getPendingCount = async (): Promise<number> => {
  try {
    const pendingLogs = await getFromStorage<PendingCigLog[]>(STORAGE_KEYS.PENDING_LOGS) || [];
    const pendingJournal = await getFromStorage<PendingJournalEntry[]>(STORAGE_KEYS.PENDING_JOURNAL) || [];
    return pendingLogs.length + pendingJournal.length;
  } catch (error) {
    console.error('Error getting pending count:', error);
    return 0;
  }
};

/**
 * Get last sync timestamp
 */
export const getLastSyncTime = async (): Promise<string | null> => {
  try {
    return await getFromStorage<string>(STORAGE_KEYS.LAST_SYNC);
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
};
