import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { AuthScreen } from '../../screens/AuthScreen';
import * as authService from '../../services/authService';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock the auth service
jest.mock('../../services/authService');

describe('Authentication Flow Integration Test', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
      },
    });
    jest.clearAllMocks();
  });

  describe('Signup Flow', () => {
    it('should complete full signup process', async () => {
      const mockSignup = authService.signup as jest.MockedFunction<
        typeof authService.signup
      >;
      mockSignup.mockResolvedValueOnce({
        user: { id: '123', email: 'newuser@example.com' },
        token: 'test-token',
      });

      const { getByPlaceholderText, getByText } = render(
        <Provider store={store}>
          <AuthScreen />
        </Provider>
      );

      // Switch to signup tab
      const signupTab = getByText(/Sign Up/i);
      fireEvent.press(signupTab);

      // Fill in signup form
      const emailInput = getByPlaceholderText(/Email/i);
      const passwordInput = getByPlaceholderText(/^Password$/i);
      const confirmPasswordInput = getByPlaceholderText(/Confirm Password/i);

      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'Password123');
      fireEvent.changeText(confirmPasswordInput, 'Password123');

      // Submit form
      const signupButton = getByText(/Create Account/i);
      fireEvent.press(signupButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith(
          'newuser@example.com',
          'Password123'
        );
      });
    });

    it('should show validation errors for invalid input', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(
        <Provider store={store}>
          <AuthScreen />
        </Provider>
      );

      // Switch to signup tab
      fireEvent.press(getByText(/Sign Up/i));

      // Fill in invalid data
      const emailInput = getByPlaceholderText(/Email/i);
      const passwordInput = getByPlaceholderText(/^Password$/i);

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'weak');

      // Submit form
      const signupButton = getByText(/Create Account/i);
      fireEvent.press(signupButton);

      // Should show validation errors
      await waitFor(() => {
        expect(findByText(/valid email/i)).toBeTruthy();
      });
    });

    it('should show error when passwords do not match', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(
        <Provider store={store}>
          <AuthScreen />
        </Provider>
      );

      fireEvent.press(getByText(/Sign Up/i));

      const emailInput = getByPlaceholderText(/Email/i);
      const passwordInput = getByPlaceholderText(/^Password$/i);
      const confirmPasswordInput = getByPlaceholderText(/Confirm Password/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'Password123');
      fireEvent.changeText(confirmPasswordInput, 'DifferentPassword123');

      fireEvent.press(getByText(/Create Account/i));

      await waitFor(() => {
        expect(findByText(/passwords.*match/i)).toBeTruthy();
      });
    });
  });

  describe('Login Flow', () => {
    it('should complete full login process', async () => {
      const mockLogin = authService.login as jest.MockedFunction<
        typeof authService.login
      >;
      mockLogin.mockResolvedValueOnce({
        user: { id: '123', email: 'user@example.com' },
        token: 'test-token',
      });

      const { getByPlaceholderText, getByText } = render(
        <Provider store={store}>
          <AuthScreen />
        </Provider>
      );

      // Fill in login form
      const emailInput = getByPlaceholderText(/Email/i);
      const passwordInput = getByPlaceholderText(/Password/i);

      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent.changeText(passwordInput, 'Password123');

      // Submit form
      const loginButton = getByText(/^Log In$/i);
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          'user@example.com',
          'Password123'
        );
      });
    });

    it('should show error for invalid credentials', async () => {
      const mockLogin = authService.login as jest.MockedFunction<
        typeof authService.login
      >;
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

      const { getByPlaceholderText, getByText, findByText } = render(
        <Provider store={store}>
          <AuthScreen />
        </Provider>
      );

      const emailInput = getByPlaceholderText(/Email/i);
      const passwordInput = getByPlaceholderText(/Password/i);

      fireEvent.changeText(emailInput, 'wrong@example.com');
      fireEvent.changeText(passwordInput, 'WrongPassword123');

      fireEvent.press(getByText(/^Log In$/i));

      await waitFor(() => {
        expect(findByText(/Invalid credentials/i)).toBeTruthy();
      });
    });
  });

  describe('Form Switching', () => {
    it('should switch between login and signup forms', () => {
      const { getByText, queryByText } = render(
        <Provider store={store}>
          <AuthScreen />
        </Provider>
      );

      // Should start on login
      expect(getByText(/^Log In$/i)).toBeTruthy();

      // Switch to signup
      fireEvent.press(getByText(/Sign Up/i));
      expect(getByText(/Create Account/i)).toBeTruthy();
      expect(getByText(/Confirm Password/i)).toBeTruthy();

      // Switch back to login
      fireEvent.press(getByText(/Log In/i));
      expect(queryByText(/Confirm Password/i)).toBeNull();
    });
  });
});
