# Navigation Structure

## Overview

The app uses React Navigation v6 with a combination of Stack and Tab navigators to provide a seamless user experience.

## Navigation Hierarchy

```
RootNavigator
├── AuthNavigator (Stack) - Unauthenticated users
│   ├── AuthScreen (Login/Signup)
│   └── PlanSetupScreen (Initial quit plan setup)
│
└── AppNavigator (Bottom Tabs) - Authenticated users with quit plan
    ├── Home (HomeScreen)
    ├── Progress (ProgressScreen)
    ├── Journal (JournalScreen)
    ├── Achievements (AchievementsScreen)
    └── Settings (SettingsScreen)
```

## Navigators

### RootNavigator

The root navigator handles the authentication flow and app initialization.

**Features:**
- Checks authentication status on app start
- Initializes app state from storage
- Switches between AuthNavigator and AppNavigator based on auth state
- Shows loading screen during initialization

**Location:** `client/src/navigation/RootNavigator.tsx`

### AuthNavigator (Stack Navigator)

Handles the authentication and onboarding flow for unauthenticated users.

**Screens:**
- **AuthScreen**: Login and signup forms
- **PlanSetupScreen**: Initial quit plan configuration wizard

**Navigation Flow:**
1. User lands on AuthScreen
2. After successful login/signup, automatically navigates to PlanSetupScreen if no plan exists
3. After plan setup, automatically switches to AppNavigator

**Location:** `client/src/navigation/AuthNavigator.tsx`

### AppNavigator (Bottom Tab Navigator)

Main app navigation for authenticated users with a quit plan.

**Tabs:**
1. **Home** (🏠): Dashboard with daily progress, quick log button, and SOS access
2. **Progress** (📊): Charts, statistics, savings, and achievements
3. **Journal** (📖): Mood and craving journal entries
4. **Achievements** (🏆): Earned and upcoming achievements
5. **Settings** (⚙️): App settings, plan modification, notifications, rewards

**Tab Bar Configuration:**
- Active color: #4CAF50 (green)
- Inactive color: #999 (gray)
- Icons: Ionicons from @expo/vector-icons
- Height: 60px with padding

**Location:** `client/src/navigation/AppNavigator.tsx`

## Navigation Guards

The app implements navigation guards through Redux state:

```typescript
{isAuthenticated && hasSetupPlan ? <AppNavigator /> : <AuthNavigator />}
```

**Guards:**
- **Authentication**: User must be authenticated to access AppNavigator
- **Plan Setup**: User must have completed plan setup to access AppNavigator
- **Automatic Routing**: Navigation automatically switches when state changes

## Modal Navigation

Modal screens (like CravingSOS) are implemented as React Native modals within components rather than navigation screens. This allows them to be accessible from any screen without navigation complexity.

**Modal Components:**
- **CravingSOS**: Accessible from Home screen via SOS button
- **AchievementNotification**: Triggered automatically when achievements are earned
- **PunishmentReminder**: Triggered when daily limits are exceeded

## Type Safety

TypeScript types are defined for all navigation props and routes:

**Location:** `client/src/navigation/types.ts`

**Usage Example:**
```typescript
import { HomeScreenNavigationProp } from '../navigation/types';

interface Props {
  navigation: HomeScreenNavigationProp;
}
```

## Deep Linking

Deep linking is not currently implemented but can be added to the NavigationContainer:

```typescript
<NavigationContainer linking={linkingConfig}>
  {/* navigators */}
</NavigationContainer>
```

## Navigation State Persistence

Navigation state persistence is not currently implemented but can be added for better UX:

```typescript
const [isReady, setIsReady] = useState(false);
const [initialState, setInitialState] = useState();

// Save state
onStateChange={(state) => AsyncStorage.setItem('navigation', JSON.stringify(state))}

// Restore state
initialState={initialState}
```

## Screen Options

All screens have `headerShown: false` to use custom headers within each screen component. This provides more flexibility for screen-specific UI.

## Future Enhancements

Potential navigation improvements:
- [ ] Add deep linking support for notifications
- [ ] Implement navigation state persistence
- [ ] Add screen transition animations
- [ ] Create a modal stack for full-screen modals
- [ ] Add gesture-based navigation
- [ ] Implement tab bar badges for notifications
- [ ] Add screen-specific back button handling

## Testing Navigation

To test navigation:

1. **Authentication Flow:**
   - Start app → Should show AuthScreen
   - Login → Should show PlanSetupScreen (if no plan)
   - Complete plan → Should show AppNavigator

2. **Tab Navigation:**
   - Tap each tab → Should navigate to correct screen
   - Tab bar should highlight active tab
   - Screen state should persist when switching tabs

3. **State Changes:**
   - Logout → Should return to AuthScreen
   - Complete plan setup → Should switch to AppNavigator

## Dependencies

- `@react-navigation/native`: ^6.1.18
- `@react-navigation/stack`: ^6.4.1
- `@react-navigation/bottom-tabs`: ^6.6.1
- `react-native-gesture-handler`: ^2.20.2
- `react-native-screens`: ^4.4.0
- `react-native-safe-area-context`: ^4.12.0

All dependencies are compatible with Expo SDK 52.
