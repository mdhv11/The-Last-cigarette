import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus, View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineIndicator } from './src/components/OfflineIndicator';
import { RootNavigator } from './src/navigation';
import { handleAppStateChange } from './src/services/appInitService';
import { setupGlobalErrorHandler } from './src/utils/errorReporting';
import { performanceMonitor } from './src/utils/performance';

const AppContent: React.FC = () => {
  const appState = useRef(AppState.currentState);

  // Initialize performance monitoring and error reporting
  useEffect(() => {
    setupGlobalErrorHandler();
    
    // Log app startup time
    const endTiming = performanceMonitor.startTiming('app:startup');
    endTiming();

    // Log performance summary every 5 minutes in development
    if (__DEV__) {
      const interval = setInterval(() => {
        const summary = performanceMonitor.getSummary();
        console.log('Performance Summary:', summary);
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground');
      }
      
      await handleAppStateChange(nextAppState);
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <OfflineIndicator />
        <RootNavigator />
        <StatusBar style="auto" />
      </View>
    </ErrorBoundary>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
