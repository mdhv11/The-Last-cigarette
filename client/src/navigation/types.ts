import { NavigationProp, RouteProp } from '@react-navigation/native';
import { MainTabParamList } from './AppNavigator';
import { AuthStackParamList } from './AuthNavigator';

// Navigation prop types for main app screens
export type HomeScreenNavigationProp = NavigationProp<MainTabParamList, 'Home'>;
export type ProgressScreenNavigationProp = NavigationProp<MainTabParamList, 'Progress'>;
export type JournalScreenNavigationProp = NavigationProp<MainTabParamList, 'Journal'>;
export type AchievementsScreenNavigationProp = NavigationProp<MainTabParamList, 'Achievements'>;
export type SettingsScreenNavigationProp = NavigationProp<MainTabParamList, 'Settings'>;

// Navigation prop types for auth screens
export type AuthScreenNavigationProp = NavigationProp<AuthStackParamList, 'Auth'>;
export type PlanSetupScreenNavigationProp = NavigationProp<AuthStackParamList, 'PlanSetup'>;

// Route prop types
export type HomeScreenRouteProp = RouteProp<MainTabParamList, 'Home'>;
export type ProgressScreenRouteProp = RouteProp<MainTabParamList, 'Progress'>;
export type JournalScreenRouteProp = RouteProp<MainTabParamList, 'Journal'>;
export type AchievementsScreenRouteProp = RouteProp<MainTabParamList, 'Achievements'>;
export type SettingsScreenRouteProp = RouteProp<MainTabParamList, 'Settings'>;

export type AuthScreenRouteProp = RouteProp<AuthStackParamList, 'Auth'>;
export type PlanSetupScreenRouteProp = RouteProp<AuthStackParamList, 'PlanSetup'>;
