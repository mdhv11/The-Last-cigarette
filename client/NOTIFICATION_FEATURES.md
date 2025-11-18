# Notification Features

This document describes the push notification and reminder system implemented in the Quit Smoking App.

## Overview

The app uses Expo Notifications to provide local and push notifications that help users stay on track with their quit plan. Notifications are fully customizable through the settings screen.

## Features Implemented

### 1. Daily Reminders
- **Purpose**: Remind users to log their cigarettes and check their progress
- **Default Time**: 9:00 AM (customizable)
- **Frequency**: Once per day
- **User Control**: Can be enabled/disabled in settings

### 2. Achievement Notifications
- **Purpose**: Celebrate when users unlock new achievements
- **Trigger**: Automatically sent when a new achievement is earned
- **Content**: Achievement name and description
- **User Control**: Can be enabled/disabled in settings

### 3. Target Warning Notifications
- **Purpose**: Alert users when approaching their daily cigarette limit
- **Trigger**: Sent when 25% or less cigarettes remain for the day, or only 1 left
- **Content**: Remaining count and motivational message
- **User Control**: Can be enabled/disabled in settings

### 4. Craving Support Notifications
- **Purpose**: Provide encouragement during difficult times
- **Trigger**: 
  - Automatically sent when user opens the SOS feature
  - Scheduled 3 times per day (10 AM, 3 PM, 8 PM) if enabled
- **Content**: Motivational quotes and support messages
- **User Control**: Can be enabled/disabled in settings

## Technical Implementation

### Service Layer
- **File**: `client/src/services/notificationService.ts`
- **Key Functions**:
  - `requestPermissions()`: Request notification permissions from user
  - `scheduleDailyReminder()`: Schedule recurring daily reminder
  - `sendAchievementNotification()`: Send immediate achievement notification
  - `sendTargetWarning()`: Send target warning notification
  - `sendCravingSupport()`: Send craving support notification
  - `updatePreferences()`: Update all notification schedules based on user preferences

### State Management
- **File**: `client/src/store/notificationSlice.ts`
- **State**:
  - `preferences`: User notification preferences
  - `hasPermission`: Whether notification permissions are granted
  - `isInitialized`: Whether notification service is initialized
- **Actions**:
  - `initializeNotifications`: Initialize notification service on app start
  - `updateNotificationPreferences`: Save and apply new preferences
  - `sendAchievementNotification`: Dispatch achievement notification
  - `sendTargetWarningNotification`: Dispatch target warning notification
  - `sendCravingSupportNotification`: Dispatch craving support notification

### UI Components
- **NotificationSettings**: Settings screen for managing notification preferences
- **useNotifications Hook**: Handles notification responses and navigation

### Integration Points

#### App Initialization
- Notifications are initialized in `appInitService.ts` during app startup
- Saved preferences are loaded from AsyncStorage
- Notification schedules are set up based on preferences

#### Cigarette Logging
- Target warnings are triggered in `QuickLogButton.tsx` after logging
- Checks if user is approaching daily limit (25% or less remaining)

#### Achievements
- Achievement notifications are triggered in `HomeScreen.tsx`
- Sent when `checkAchievements` returns new achievements

#### Craving SOS
- Craving support notifications are triggered in `CravingSOS.tsx`
- Sent immediately when user opens the SOS feature

## Notification Types and Data

Each notification includes a `data` field with a `type` property for handling responses:

- `daily-reminder`: Daily reminder to log cigarettes
- `achievement`: Achievement unlocked
- `target-warning`: Approaching daily limit
- `craving-support`: Craving support message
- `milestone`: Milestone reached

## User Preferences

Users can customize notifications through the Settings screen:

```typescript
interface NotificationPreferences {
  dailyReminders: boolean;        // Enable/disable daily reminders
  achievementAlerts: boolean;     // Enable/disable achievement notifications
  cravingSupport: boolean;        // Enable/disable craving support
  targetWarnings: boolean;        // Enable/disable target warnings
  reminderTime: string;           // Time for daily reminder (HH:MM format)
}
```

## Platform-Specific Notes

### Android
- Requires `SCHEDULE_EXACT_ALARM` permission (already added to app.json)
- Uses notification channels for better control
- Default channel: "default" with high importance

### iOS
- Requires user permission prompt
- Notifications work on physical devices only (not simulator)

## Testing

To test notifications:

1. **Daily Reminders**: Change `reminderTime` to a few minutes in the future
2. **Achievement Notifications**: Complete an achievement requirement
3. **Target Warnings**: Log cigarettes until approaching daily limit
4. **Craving Support**: Open the SOS feature from any screen

## Future Enhancements

Potential improvements for future versions:

- Custom notification sounds
- Rich notifications with images
- Notification history
- Smart notification timing based on user behavior
- Weekly progress summary notifications
- Reminder to update quit plan
- Celebration notifications for milestones (1 week, 1 month, etc.)

## Troubleshooting

### Notifications not appearing
1. Check device notification settings
2. Verify app has notification permissions
3. Check notification preferences in app settings
4. Ensure app is running on a physical device (not simulator)

### Notifications not scheduled
1. Check `hasPermission` state in Redux
2. Verify preferences are saved correctly
3. Check console logs for errors
4. Use `getScheduledNotifications()` to debug scheduled notifications

## Dependencies

- `expo-notifications`: ~0.29.0
- `expo-device`: Latest version
- `@react-native-async-storage/async-storage`: For storing preferences
