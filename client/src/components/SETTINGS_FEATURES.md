# Settings and Customization Features

## Overview

The Settings system provides comprehensive customization options for users to personalize their quit smoking experience. All settings are accessible from the SettingsScreen with dedicated sub-screens for each category.

## Components

### 1. SettingsScreen (Main Hub)

The main settings screen that provides navigation to all customization options.

**Features:**
- Quit plan modification access
- Notification preferences
- Punishment/accountability settings
- Rewards list management
- Current plan summary display
- Clean, organized interface with sections

**Navigation:**
- Uses a view-based navigation system
- Each setting opens a dedicated full-screen component
- Unsaved changes protection with confirmation dialogs

### 2. NotificationSettings

Manage all notification preferences and reminders.

**Features:**
- Daily reminders toggle (with time selection)
- Achievement alerts toggle
- Craving support notifications toggle
- Target warning notifications toggle
- Visual switch controls for easy toggling
- Informative descriptions for each option
- Save/Cancel with unsaved changes protection

**Settings Available:**
- **Daily Reminders**: Get reminded to log cigarettes each day
- **Achievement Alerts**: Celebrate milestone unlocks
- **Craving Support**: Receive encouragement during difficult times
- **Target Warnings**: Get notified when approaching daily limit

### 3. PunishmentSettings

Configure the accountability system with donation commitments.

**Features:**
- Enable/disable punishment system
- Set donation amount per cigarette over target
- Choose charity name (with suggestions)
- Configure trigger threshold
- Example calculation display
- Suggested charities list
- Form validation

**Suggested Charities:**
- American Cancer Society
- American Lung Association
- Truth Initiative

**How It Works:**
- User sets a donation amount (e.g., $5)
- When exceeding daily target, user is reminded to donate
- Donation amount multiplies by number of cigarettes over target
- Example: 3 cigarettes over = $15 donation

### 4. RewardsSettings

Create and manage a personalized list of rewards for achieving milestones.

**Features:**
- Add custom rewards with name, cost, and milestone
- View all rewards in a list
- Delete rewards with confirmation
- Total rewards count and value summary
- Reward ideas and suggestions
- Form validation for new rewards
- Save/Cancel with unsaved changes protection

**Reward Structure:**
- **Name**: What you'll treat yourself to
- **Cost**: Estimated cost of the reward
- **Milestone**: When you'll earn it (e.g., "1 week smoke-free")

**Example Rewards:**
- Nice dinner out ($50) - 1 week smoke-free
- New book or game ($30) - 2 weeks smoke-free
- Spa day ($100) - 1 month smoke-free

## Integration

### SettingsScreen Navigation

The SettingsScreen uses a state-based navigation system:

```typescript
type SettingsView = 'main' | 'plan' | 'notifications' | 'punishment' | 'rewards';
```

Each sub-view is rendered as a full-screen component with its own header and save/cancel buttons.

### Data Persistence

Currently, the settings components simulate API calls with setTimeout. In production:
- Settings should be saved to the User model in MongoDB
- Use Redux slices for state management
- Implement proper API endpoints for each settings category

## User Experience

### Unsaved Changes Protection

All settings screens include protection against accidental data loss:
- Tracks if changes have been made
- Shows confirmation dialog when canceling with unsaved changes
- Clear "Save" and "Cancel" buttons in header

### Form Validation

Each settings component includes appropriate validation:
- Required field checks
- Numeric range validation
- Positive number validation
- Clear error messages below fields

### Visual Feedback

- Loading indicators during save operations
- Success alerts after saving
- Error messages for validation failures
- Disabled states for buttons during loading

## Future Enhancements

Potential additions for future versions:
- [ ] Backend API integration for settings persistence
- [ ] Redux state management for settings
- [ ] Time picker for notification reminder time
- [ ] Multiple reminder times per day
- [ ] Custom notification sounds
- [ ] Reward progress tracking
- [ ] Automatic reward suggestions based on savings
- [ ] Export/import settings
- [ ] Settings backup and restore
- [ ] Dark mode toggle
- [ ] Language preferences
- [ ] Data export options

## Requirements Fulfilled

This implementation fulfills the following requirements from the design document:

- **8.1**: User preferences and customization options
- **8.2**: Notification settings for reminders and alerts
- **8.3**: Punishment configuration for accountability
- **8.4**: Rewards customization for personal treats
- **8.5**: Settings persistence and management
- **8.6**: User-friendly settings interface
