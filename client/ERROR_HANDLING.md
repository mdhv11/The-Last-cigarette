# Error Handling and User Feedback System

## Overview

This document describes the comprehensive error handling and user feedback system implemented in the Quit Smoking app. The system provides consistent error management, user-friendly feedback, and graceful degradation for offline scenarios.

## Components

### 1. ErrorBoundary

A React error boundary component that catches JavaScript errors anywhere in the component tree.

**Features:**
- Catches and displays errors in a user-friendly way
- Shows detailed error information in development mode
- Provides a "Try Again" button to reset the error state
- Logs errors for debugging and monitoring

**Usage:**
```tsx
import { ErrorBoundary } from './components';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 2. ErrorMessage

A reusable component for displaying error, warning, and info messages.

**Features:**
- Three types: error, warning, info
- Optional retry and dismiss actions
- Consistent styling across the app

**Usage:**
```tsx
import { ErrorMessage } from './components';

<ErrorMessage
  message="Failed to load data"
  type="error"
  onRetry={() => refetch()}
  onDismiss={() => clearError()}
/>
```

### 3. LoadingState

A consistent loading indicator component.

**Features:**
- Customizable size (small/large)
- Optional loading message
- Full-screen or inline display

**Usage:**
```tsx
import { LoadingState } from './components';

<LoadingState message="Loading your progress..." fullScreen />
```

### 4. OfflineIndicator

An animated banner that appears when the device is offline.

**Features:**
- Automatically detects online/offline status
- Smooth slide-in/out animation
- Non-intrusive design

**Usage:**
```tsx
import { OfflineIndicator } from './components';

// Add to root component
<OfflineIndicator />
```

## Utilities

### Error Handling Utilities (`utils/errorHandling.ts`)

#### parseApiError(error)
Converts API errors into user-friendly messages.

**Handles:**
- Network errors
- Timeout errors
- HTTP status codes (400, 401, 403, 404, 429, 500, etc.)
- Generic errors

#### retryOperation(operation, maxRetries, baseDelay)
Retries failed operations with exponential backoff.

**Parameters:**
- `operation`: Async function to retry
- `maxRetries`: Maximum number of retry attempts (default: 3)
- `baseDelay`: Base delay in milliseconds (default: 1000)

**Usage:**
```tsx
const data = await retryOperation(
  () => fetch('/api/data'),
  3,
  1000
);
```

#### isNetworkError(error)
Checks if an error is a network-related error.

#### isAuthError(error)
Checks if an error requires re-authentication.

#### formatErrorMessage(error)
Formats error for display to users.

#### logError(error, context)
Logs errors for debugging and monitoring.

### Form Validation

#### useFormValidation Hook

A custom hook for form validation with real-time feedback.

**Features:**
- Real-time validation on blur
- Validation on change after first blur
- Batch validation for form submission
- Reset functionality

**Usage:**
```tsx
import { useFormValidation } from '../hooks/useFormValidation';
import { required, email, minLength } from '../utils/validationRules';

const { values, errors, touched, handleChange, handleBlur, validateAll } = 
  useFormValidation(
    { email: '', password: '' },
    {
      email: [required(), email()],
      password: [required(), minLength(8)],
    }
  );
```

#### Validation Rules (`utils/validationRules.ts`)

Pre-built validation rules:
- `required(message)` - Field is required
- `email(message)` - Valid email format
- `minLength(min, message)` - Minimum length
- `maxLength(max, message)` - Maximum length
- `minValue(min, message)` - Minimum numeric value
- `maxValue(max, message)` - Maximum numeric value
- `pattern(regex, message)` - Custom regex pattern
- `password(message)` - Strong password (8+ chars, uppercase, lowercase, number)
- `matchField(fieldName, getValue, message)` - Match another field
- `positiveNumber(message)` - Positive number
- `integer(message)` - Whole number
- `dateAfter(date, message)` - Date after specified date
- `dateBefore(date, message)` - Date before specified date

## Best Practices

### 1. Wrap Components with ErrorBoundary

Wrap major sections or screens with ErrorBoundary to prevent entire app crashes:

```tsx
<ErrorBoundary>
  <HomeScreen />
</ErrorBoundary>
```

### 2. Use Consistent Error Display

Always use ErrorMessage component for displaying errors:

```tsx
{error && (
  <ErrorMessage
    message={formatErrorMessage(error)}
    onRetry={handleRetry}
  />
)}
```

### 3. Show Loading States

Always show loading indicators during async operations:

```tsx
{isLoading && <LoadingState message="Saving..." />}
```

### 4. Handle Offline Scenarios

Check online status before making API calls:

```tsx
const isOnline = useSelector((state: RootState) => state.sync.isOnline);

if (!isOnline) {
  // Queue for later or show offline message
  return;
}
```

### 5. Implement Retry Logic

Use retryOperation for transient failures:

```tsx
try {
  const data = await retryOperation(() => fetchData(), 3);
} catch (error) {
  // Handle final failure
}
```

### 6. Validate Forms

Use useFormValidation hook for all forms:

```tsx
const { values, errors, handleChange, handleBlur, validateAll } = 
  useFormValidation(initialValues, validationRules);

const handleSubmit = () => {
  if (validateAll()) {
    // Submit form
  }
};
```

### 7. Log Errors

Always log errors for debugging:

```tsx
catch (error) {
  logError(error, 'HomeScreen.fetchData');
  // Handle error
}
```

## Error Types and Handling

### Network Errors
- **Detection**: `isNetworkError(error)`
- **Handling**: Queue for offline sync, show offline indicator
- **Message**: "No internet connection. Please check your network and try again."

### Authentication Errors (401)
- **Detection**: `isAuthError(error)`
- **Handling**: Clear auth state, redirect to login
- **Message**: "Your session has expired. Please log in again."

### Validation Errors (400)
- **Handling**: Display field-specific errors
- **Message**: Show validation details from API

### Server Errors (500+)
- **Handling**: Retry with backoff, show generic error
- **Message**: "Server error. Please try again later."

### Rate Limiting (429)
- **Handling**: Retry after delay
- **Message**: "Too many requests. Please wait a moment and try again."

## Testing Error Handling

### Manual Testing

1. **Network Errors**: Turn off WiFi/data
2. **Server Errors**: Use invalid API endpoint
3. **Validation Errors**: Submit invalid form data
4. **Component Errors**: Trigger runtime error in component

### Automated Testing

```tsx
// Example test
it('displays error message on API failure', async () => {
  const { getByText } = render(<Component />);
  
  // Trigger error
  fireEvent.press(getByText('Load Data'));
  
  // Check error display
  await waitFor(() => {
    expect(getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Future Enhancements

- [ ] Integrate error reporting service (e.g., Sentry)
- [ ] Add error analytics and tracking
- [ ] Implement custom error pages for specific error types
- [ ] Add error recovery suggestions
- [ ] Implement automatic error reporting in production
- [ ] Add user feedback mechanism for errors
- [ ] Create error documentation for users

## Requirements Fulfilled

This implementation fulfills requirement **9.3**: Error handling and user feedback
- ✅ Comprehensive error boundaries
- ✅ User-friendly error messages
- ✅ Form validation with real-time feedback
- ✅ Retry mechanisms for failed API calls
- ✅ Offline mode indicators
- ✅ Graceful degradation
