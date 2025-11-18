import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { QuickLogButton } from '../../components/QuickLogButton';

const mockStore = configureStore([]);

describe('QuickLogButton Component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      auth: {
        token: 'test-token',
        user: { id: '123', email: 'test@example.com' },
      },
      cigLog: {
        todayStats: {
          totalToday: 5,
          dailyTarget: 10,
          remaining: 5,
          exceeded: false,
        },
        isLoading: false,
        error: null,
      },
    });
  });

  it('should render the quick log button', () => {
    const { getByText } = render(
      <Provider store={store}>
        <QuickLogButton onLogComplete={jest.fn()} />
      </Provider>
    );

    expect(getByText(/Log Cigarette/i)).toBeTruthy();
  });

  it('should open modal when button is pressed', () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <QuickLogButton onLogComplete={jest.fn()} />
      </Provider>
    );

    const button = getByText(/Log Cigarette/i);
    fireEvent.press(button);

    // Modal should be visible
    expect(getByText(/How many cigarettes/i)).toBeTruthy();
  });

  it('should allow incrementing and decrementing count', () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <QuickLogButton onLogComplete={jest.fn()} />
      </Provider>
    );

    // Open modal
    fireEvent.press(getByText(/Log Cigarette/i));

    // Find increment button and press it
    const incrementButton = getByText('+');
    fireEvent.press(incrementButton);

    // Count should increase (default is 1, so should be 2)
    expect(getByText('2')).toBeTruthy();

    // Decrement
    const decrementButton = getByText('-');
    fireEvent.press(decrementButton);

    // Should be back to 1
    expect(getByText('1')).toBeTruthy();
  });

  it('should not allow count to go below 1', () => {
    const { getByText } = render(
      <Provider store={store}>
        <QuickLogButton onLogComplete={jest.fn()} />
      </Provider>
    );

    fireEvent.press(getByText(/Log Cigarette/i));

    const decrementButton = getByText('-');
    fireEvent.press(decrementButton);
    fireEvent.press(decrementButton);

    // Should still be 1
    expect(getByText('1')).toBeTruthy();
  });

  it('should call onLogComplete after successful log', async () => {
    const onLogComplete = jest.fn();
    const { getByText } = render(
      <Provider store={store}>
        <QuickLogButton onLogComplete={onLogComplete} />
      </Provider>
    );

    fireEvent.press(getByText(/Log Cigarette/i));

    const logButton = getByText(/^Log$/i);
    fireEvent.press(logButton);

    await waitFor(() => {
      expect(onLogComplete).toHaveBeenCalled();
    });
  });

  it('should close modal when cancel is pressed', () => {
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <QuickLogButton onLogComplete={jest.fn()} />
      </Provider>
    );

    fireEvent.press(getByText(/Log Cigarette/i));
    expect(getByText(/How many cigarettes/i)).toBeTruthy();

    fireEvent.press(getByText(/Cancel/i));

    // Modal should be closed
    expect(queryByText(/How many cigarettes/i)).toBeNull();
  });
});
