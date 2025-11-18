# Offline Support & Data Persistence

This document describes the offline support and data persistence features implemented in TheLastCigarette app.

## Features

### 1. Local Storage with AsyncStorage
- All critical data is persisted locally using React Native AsyncStorage
- Supports offline data entry and viewing
- Data is automatically synchronized when connectivity returns

### 2. Secure Token Storage
- Authentication tokens are stored securely using Expo SecureStore
- Automatic login for returning users with valid tokens
- Fallback to AsyncStorage if SecureStore is unavailable

### 3. Offline Queue System
- Cigarette logs and journal entries are queued when offline
- Automatic synchronization when connection is restored
- Conflict resolution prioritizes most recent timestamp

### 4. App State Restoration
- User state is automatically restored on app startup
- Cached data is loaded immediately for fast startup
- Fresh data is fetched from API when online

### 5. Background/Foreground Handling
- Data is backed up when app goes to background
- Automatic sync check when app returns to foreground
- Online status monitoring

## Storage Keys

The following keys are used in AsyncStorage:

- `@auth_token` - Authentication token (fallback)
- `@user_data` - User profile data
- `@pending_logs` - Queued cigarette logs
- `@pending_journal` - Queued journal entries
- `@cached_stats` - Cached statistics
- `@cached_plan` - Cached quit plan
- `@last_sync` - Last synchronization timestamp

## Services

### storage.ts
Core storage utilities for AsyncStorage operations:
- `saveToStorage()` - Save data
- `getFromStorage()` - Retrieve data
- `removeFromStorage()` - Delete data
- `clearAllStorage()` - Clear all app data

### syncService.ts
Synchronization logic for offline support:
- `queueCigLog()` - Queue cigarette log
- `queueJournalEntry()` - Queue journal entry
- `syncAllPendingData()` - Sync all queued items
- `isOnline()` - Check connectivity status
- `getPendingCount()` - Get number of pending items

### authService.ts
Secure authentication storage:
- `saveAuthToken()` - Store token securely
- `getAuthToken()` - Retrieve token
- `verifyToken()` - Validate token with backend
- `clearAuthData()` - Remove all auth data

### appInitService.ts
App initialization and state restoration:
- `initializeApp()` - Initialize app on startup
- `handleAppStateChange()` - Handle foreground/background
- `backupAppData()` - Backup critical data

## Redux Integration

### syncSlice
Manages synchronization state:
- Online/offline status
- Pending items count
- Sync progress and errors
- Last sync timestamp

### Updated Slices
The following slices have been updated to support offline mode:
- `cigLogSlice` - Queues logs when offline
- `journalSlice` - Queues entries when offline

## Components

### SyncStatus
Visual indicator showing:
- Online/offline status
- Number of pending items
- Last sync time
- Sync errors with retry option

## Usage

### Automatic Behavior
The app automatically:
1. Saves data locally when offline
2. Queues changes for synchronization
3. Syncs when connectivity returns
4. Restores state on app restart

### Manual Sync
Users can manually trigger sync by:
1. Tapping the sync status indicator
2. Pulling to refresh on screens (if implemented)

## Error Handling

### Network Errors
- Failed API calls automatically queue data
- User sees optimistic UI updates
- Sync status shows pending items

### Sync Conflicts
- Most recent timestamp wins
- Failed syncs are retried
- Errors are logged and displayed

## Testing

To test offline support:
1. Enable airplane mode on device
2. Log cigarettes or create journal entries
3. Verify data is saved locally
4. Disable airplane mode
5. Verify automatic synchronization

## Future Enhancements

Potential improvements:
- Conflict resolution UI for user choice
- Selective sync (choose what to sync)
- Data compression for large datasets
- Background sync using background tasks
- Offline-first architecture with local database
