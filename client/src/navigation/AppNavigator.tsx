import React, { lazy, Suspense } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';

// Lazy load non-critical screens
const ProgressScreen = lazy(() => import('../screens/ProgressScreen').then(m => ({ default: m.ProgressScreen })));
const JournalScreen = lazy(() => import('../screens/JournalScreen').then(m => ({ default: m.JournalScreen })));
const SettingsScreen = lazy(() => import('../screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const AchievementsScreen = lazy(() => import('../screens/AchievementsScreen').then(m => ({ default: m.AchievementsScreen })));

// Loading fallback component
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4CAF50" />
  </View>
);

export type MainTabParamList = {
  Home: undefined;
  Progress: undefined;
  Journal: undefined;
  Achievements: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Wrapper component for lazy-loaded screens
const LazyScreen: React.FC<{ component: React.LazyExoticComponent<React.FC> }> = ({ component: Component }) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Journal') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Achievements') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Progress">
        {() => <LazyScreen component={ProgressScreen} />}
      </Tab.Screen>
      <Tab.Screen name="Journal">
        {() => <LazyScreen component={JournalScreen} />}
      </Tab.Screen>
      <Tab.Screen name="Achievements">
        {() => <LazyScreen component={AchievementsScreen} />}
      </Tab.Screen>
      <Tab.Screen name="Settings">
        {() => <LazyScreen component={SettingsScreen} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
