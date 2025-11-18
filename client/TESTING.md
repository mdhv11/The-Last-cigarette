# Testing Guide

## Overview

This document describes the testing strategy and implementation for the Quit Smoking App client application.

## Test Structure

```
src/__tests__/
├── utils/                    # Unit tests for utility functions
│   ├── validation.test.ts
│   └── planValidation.test.ts
├── services/                 # Tests for service layer
│   └── storage.test.ts
├── components/               # Component unit tests
│   └── QuickLogButton.test.tsx
├── screens/                  # Screen component tests
│   └── (to be added)
└── integration/              # Integration tests
    ├── auth-flow.test.tsx
    └── cigarette-logging-flow.test.tsx
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- validation.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="should validate"
```

## Test Categories

### 1. Unit Tests

Unit tests focus on individual functions and components in isolation.

**Examples:**
- `validation.test.ts` - Tests email, password, and quit plan validation
- `planValidation.test.ts` - Tests daily target calculations and progress tracking
- `storage.test.ts` - Tests AsyncStorage wrapper functions

**Best Practices:**
- Test one function/component at a time
- Mock external dependencies
- Test edge cases and error conditions
- Keep tests simple and focused

### 2. Component Tests

Component tests verify that React components render correctly and handle user interactions.

**Examples:**
- `QuickLogButton.test.tsx` - Tests button rendering, modal opening, and cigarette logging

**Best Practices:**
- Use React Native Testing Library
- Test user interactions (press, text input, etc.)
- Verify rendered output
- Mock Redux store and navigation

### 3. Integration Tests

Integration tests verify that multiple components and services work together correctly.

**Examples:**
- `auth-flow.test.tsx` - Tests complete signup and login flows
- `cigarette-logging-flow.test.tsx` - Tests home screen with logging functionality

**Best Practices:**
- Test complete user workflows
- Verify data flow between components
- Test error handling and edge cases
- Use realistic mock data

## Mocking Strategy

### AsyncStorage
```typescript
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

### Expo Modules
```typescript
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  // ... other methods
}));
```

### Redux Store
```typescript
import configureStore from 'redux-mock-store';
const mockStore = configureStore([]);
const store = mockStore(initialState);
```

### Navigation
```typescript
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));
```

## Coverage Goals

- **Overall Coverage**: > 80%
- **Critical Paths**: > 90%
  - Authentication flow
  - Cigarette logging
  - Quit plan calculations
  - Data synchronization

## Writing New Tests

### 1. Create test file
Place test files next to the code they test or in the `__tests__` directory:
```
src/components/MyComponent.tsx
src/components/__tests__/MyComponent.test.tsx
```

### 2. Follow naming conventions
- Test files: `*.test.ts` or `*.test.tsx`
- Test suites: `describe('ComponentName', () => {})`
- Test cases: `it('should do something', () => {})`

### 3. Use Testing Library best practices
```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';

it('should handle button press', async () => {
  const { getByText } = render(<MyComponent />);
  const button = getByText('Click Me');
  
  fireEvent.press(button);
  
  await waitFor(() => {
    expect(getByText('Success')).toBeTruthy();
  });
});
```

### 4. Test accessibility
```typescript
it('should be accessible', () => {
  const { getByLabelText } = render(<MyComponent />);
  expect(getByLabelText('Submit')).toBeTruthy();
});
```

## Common Testing Patterns

### Testing async operations
```typescript
it('should fetch data', async () => {
  const { getByText } = render(<MyComponent />);
  
  await waitFor(() => {
    expect(getByText('Data loaded')).toBeTruthy();
  });
});
```

### Testing Redux actions
```typescript
it('should dispatch action', () => {
  const store = mockStore({});
  store.dispatch(myAction());
  
  const actions = store.getActions();
  expect(actions[0].type).toBe('MY_ACTION');
});
```

### Testing form validation
```typescript
it('should show validation error', async () => {
  const { getByPlaceholderText, getByText, findByText } = render(<Form />);
  
  fireEvent.changeText(getByPlaceholderText('Email'), 'invalid');
  fireEvent.press(getByText('Submit'));
  
  expect(await findByText(/valid email/i)).toBeTruthy();
});
```

## Debugging Tests

### Run tests with verbose output
```bash
npm test -- --verbose
```

### Debug specific test
```bash
npm test -- --testNamePattern="my test" --verbose
```

### Use console.log in tests
```typescript
it('should debug', () => {
  const { debug } = render(<MyComponent />);
  debug(); // Prints component tree
});
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment

CI configuration ensures:
- All tests pass
- Coverage thresholds are met
- No linting errors

## Future Improvements

- [ ] Add E2E tests with Detox
- [ ] Increase coverage to 90%+
- [ ] Add performance tests
- [ ] Add visual regression tests
- [ ] Add accessibility audit tests
- [ ] Add API integration tests with MSW

## Resources

- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
