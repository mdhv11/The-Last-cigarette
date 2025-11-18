# Error Handling and User Feedback Guide

This document describes the comprehensive error handling and user feedback system implemented in the application.

## Overview

The error handling system provides:
- Automatic retry mechanisms with exponential backoff
- User-friendly error messages
- Real-time form validation with feedback
- Offline mode support with graceful degradation
- Toast notifications for non-blocking feedback
- Error boundaries for React component errors

## Components

### 1. Error Handling Utilities (`utils/errorHandling.ts`)

Core utilities for parsing and handling errors:

```typescript
import { parseApiError, retryOperation, formatErrorMessage } from '../utils/errorHandling';

// Parse API errors into user-friendly messages
const error = parseApiError(apiError);

// Retry failed operations with exponential backoff
const result = await retryOperation(
  () => fetchData(),
  3, // max retries
  1000 // base delay in ms
);

// Format error for display
const message = formatErrorMessage(error);
```

### 2. API Service (`services/apiService.ts`)

Enhanced API service with automatic retry:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '../services/apiService';

// GET request with retry
const data = await apiGet('/endpoint', token, { retries: 3 });

// POST request with retry
const result = await apiPost('/endpoint', body, token, { retries: 2 });
```

### 3. Error Display Components

#### ErrorDisplay Component
Full-featured error display with retry functionality:

```typescript
import { ErrorDisplay } from '../components/ErrorDisplay';

<ErrorDisplay
  error={error}
  onRetry={handleRetry}
  onDismiss={handleDismiss}
  compact={false}
/>
```

#### ErrorMessage Component
Simple error message display:

```typescript
import { ErrorMessage } from '../components/ErrorMessage';

<ErrorMessage
  message="Something went wrong"
  type="error"
  onRetry={handleRetry}
/>
```

#### Toast Component
Non-blocking toast notifications:

```typescript
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';

const { toastState, showSuccess, showError, hideToast } = useToast();

<Toast
  message={toastState.message}
  type={toastState.type}
  visible={toastState.visible}
  onDismiss={hideToast}
/>

// Show notifications
showSuccess('Operation completed!');
showError('Something went wrong');
showWarning('Please check your input');
showInfo('New feature available');
```

### 4. Loading States

```typescript
import { LoadingState } from '../components/LoadingState';

<LoadingState
  message="Loading data..."
  size="large"
  fullScreen={true}
/>
```

### 5. Error Boundary

Catches React component errors:

```typescript
import { ErrorBoundary } from '../components/ErrorBoundary';

<ErrorBoundary fallback={<CustomErrorScreen />}>
  <YourComponent />
</ErrorBoundary>
```

### 6. Offline Indicator

Shows when the app is offline:

```typescript
import { OfflineIndicator } from '../components/OfflineIndicator';

// Add to your root component
<OfflineIndicator />
```

## Hooks

### useApiError Hook

Manage API errors with automatic parsing:

```typescript
import { useApiError } from '../hooks/useApiError';

const { error, setError, clearError, isNetworkError, isAuthError } = useApiError();

try {
  await apiCall();
} catch (err) {
  setError(err); // Automatically parses the error
}
```

### useRetry Hook

Handle retry logic:

```typescript
import { useRetry } from '../hooks/useRetry';

const { execute, retry, isRetrying, canRetry } = useRetry(
  async () => await fetchData(),
  {
    maxRetries: 3,
    onRetry: (attempt) => console.log(`Retry attempt ${attempt}`),
    onSuccess: () => console.log('Success!'),
    onError: (error) => console.error('Failed:', error),
  }
);

// Execute operation
await execute();

// Retry if failed
if (canRetry) {
  await retry();
}
```

### useEnhancedFormValidation Hook

Real-time form validation with debouncing:

```typescript
import { useEnhancedFormValidation } from '../hooks/useEnhancedFormValidation';

const {
  values,
  errors,
  touched,
  validating,
  handleChange,
  handleBlur,
  validateAll,
} = useEnhancedFormValidation(
  { email: '', password: '' },
  {
    email: [
      {
        validate: (value) => value.includes('@'),
        message: 'Invalid email',
      },
    ],
    password: [
      {
        validate: (value) => value.length >= 8,
        message: 'Password must be at least 8 characters',
      },
    ],
  },
  {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
  }
);
```

### useToast Hook

Manage toast notifications:

```typescript
import { useToast } from '../hooks/useToast';

const { toastState, showSuccess, showError, showWarning, showInfo } = useToast();

showSuccess('Saved successfully!');
showError('Failed to save');
showWarning('Please review your input');
showInfo('New update available');
```

## Redux Integration

All Redux slices now use the enhanced API service with automatic retry:

```typescript
// In your slice
import { apiPost } from '../services/apiService';
import { formatErrorMessage } from '../utils/errorHandling';

export const myAsyncAction = createAsyncThunk(
  'slice/action',
  async (data, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const result = await apiPost(
        '/endpoint',
        data,
        token,
        { retries: 3 }
      );

      return result;
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);
```

## Best Practices

### 1. Always Handle Errors in Async Operations

```typescript
const handleSubmit = async () => {
  try {
    await dispatch(myAction(data)).unwrap();
    showSuccess('Success!');
  } catch (error: any) {
    showError(error.message || 'Operation failed');
  }
};
```

### 2. Provide Retry Options for Network Errors

```typescript
<ErrorDisplay
  error={error}
  onRetry={handleRetry}
  onDismiss={clearError}
/>
```

### 3. Use Loading States During Operations

```typescript
{isLoading && <LoadingState message="Processing..." />}
```

### 4. Validate Forms in Real-Time

```typescript
<TextInput
  value={values.email}
  onChangeText={(value) => handleChange('email', value)}
  onBlur={() => handleBlur('email')}
/>
{touched.email && errors.email && (
  <Text style={styles.error}>{errors.email}</Text>
)}
```

### 5. Show Appropriate Feedback

- Use **Toast** for success messages and non-critical errors
- Use **ErrorDisplay** for critical errors that need user action
- Use **LoadingState** during async operations
- Use **OfflineIndicator** to show connectivity status

### 6. Handle Offline Mode Gracefully

```typescript
// Queue operations when offline
if (!isOnline) {
  await queueOperation(data);
  showInfo('Saved offline. Will sync when online.');
  return;
}
```

## Error Types

The system recognizes and handles these error types:

- **NETWORK_ERROR**: No internet connection
- **TIMEOUT_ERROR**: Request timed out
- **UNAUTHORIZED**: Authentication required
- **FORBIDDEN**: Insufficient permissions
- **NOT_FOUND**: Resource not found
- **CONFLICT**: Data conflict
- **RATE_LIMIT**: Too many requests
- **SERVER_ERROR**: Server-side error
- **UNKNOWN_ERROR**: Unexpected error

## Testing Error Handling

```typescript
// Test error display
<ErrorDisplay
  error={{ message: 'Test error', code: 'NETWORK_ERROR' }}
  onRetry={() => console.log('Retry')}
/>

// Test toast
showError('Test error message');

// Test loading state
<LoadingState message="Testing..." fullScreen />
```

## Migration Guide

To update existing code to use the new error handling:

1. Replace direct `fetch` calls with `apiService` methods
2. Add error handling with `try/catch` and toast notifications
3. Replace custom error displays with `ErrorDisplay` component
4. Add `LoadingState` components during async operations
5. Wrap forms with `useEnhancedFormValidation` hook

## Example: Complete Screen with Error Handling

```typescript
import React, { useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { LoadingState } from '../components/LoadingState';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';

export const MyScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((state) => state.mySlice);
  const { toastState, showSuccess, showError, hideToast } = useToast();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await dispatch(fetchData()).unwrap();
    } catch (err: any) {
      showError(err.message || 'Failed to load data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchData()).unwrap();
      showSuccess('Data refreshed');
    } catch (err: any) {
      showError(err.message || 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading && !data) {
    return <LoadingState message="Loading..." fullScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Toast
        message={toastState.message}
        type={toastState.type}
        visible={toastState.visible}
        onDismiss={hideToast}
      />
      
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={loadData}
          onDismiss={() => dispatch(clearError())}
        />
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Your content */}
      </ScrollView>
    </View>
  );
};
```
