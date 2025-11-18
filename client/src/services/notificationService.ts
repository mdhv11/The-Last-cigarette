import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPreferences {
  dailyReminders: boolean;
  achievementAlerts: boolean;
  cravingSupport: boolean;
  targetWarnings: boolean;
  reminderTime: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  dailyReminders: true,
  achievementAlerts: true,
  cravingSupport: true,
  targetWarnings: true,
  reminderTime: '09:00',
};

class NotificationService {
  private isInitialized = false;

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
    }

    this.isInitialized = true;
    return true;
  }

  /**
   * Schedule daily reminder notification
   */
  async scheduleDailyReminder(time: string = '09:00'): Promise<string | null> {
    try {
      // Cancel existing daily reminders
      await this.cancelNotificationsByTag('daily-reminder');

      const [hours, minutes] = time.split(':').map(Number);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚭 Time to Check In',
          body: "Don't forget to log your cigarettes today. You're doing great!",
          data: { type: 'daily-reminder' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      return null;
    }
  }

  /**
   * Send achievement unlock notification
   */
  async sendAchievementNotification(
    achievementName: string,
    description: string
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Achievement Unlocked!',
          body: `${achievementName}: ${description}`,
          data: { type: 'achievement', name: achievementName },
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending achievement notification:', error);
    }
  }

  /**
   * Send target warning notification
   */
  async sendTargetWarning(remaining: number, limit: number): Promise<void> {
    try {
      const percentage = (remaining / limit) * 100;
      let message = '';

      if (remaining === 1) {
        message = 'You have 1 cigarette left for today. Stay strong!';
      } else if (percentage <= 25) {
        message = `Only ${remaining} cigarettes left for today. You're almost there!`;
      }

      if (message) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚠️ Approaching Daily Limit',
            body: message,
            data: { type: 'target-warning', remaining },
            sound: true,
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error('Error sending target warning:', error);
    }
  }

  /**
   * Send craving support notification
   */
  async sendCravingSupport(): Promise<void> {
    const supportMessages = [
      'You can do this! The craving will pass in a few minutes.',
      'Remember why you started. Your health is worth it!',
      'Take a deep breath. You are stronger than this craving.',
      'Every craving you resist makes you stronger!',
      'Think about all the money you\'re saving. Treat yourself!',
    ];

    const randomMessage =
      supportMessages[Math.floor(Math.random() * supportMessages.length)];

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💪 Stay Strong',
          body: randomMessage,
          data: { type: 'craving-support' },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending craving support:', error);
    }
  }

  /**
   * Schedule periodic craving support reminders
   */
  async scheduleCravingSupportReminders(): Promise<void> {
    try {
      // Cancel existing craving support reminders
      await this.cancelNotificationsByTag('craving-support');

      // Schedule 3 reminders throughout the day
      const times = [
        { hour: 10, minute: 0 },
        { hour: 15, minute: 0 },
        { hour: 20, minute: 0 },
      ];

      for (const time of times) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '💪 You\'re Doing Great',
            body: 'Remember, every moment without smoking is a victory!',
            data: { type: 'craving-support' },
            sound: false,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: time.hour,
            minute: time.minute,
            repeats: true,
          },
        });
      }
    } catch (error) {
      console.error('Error scheduling craving support reminders:', error);
    }
  }

  /**
   * Send milestone celebration notification
   */
  async sendMilestoneNotification(
    milestone: string,
    message: string
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎊 ${milestone}`,
          body: message,
          data: { type: 'milestone', milestone },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending milestone notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  /**
   * Cancel notifications by tag/type
   */
  async cancelNotificationsByTag(tag: string): Promise<void> {
    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();

      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === tag) {
          await Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          );
        }
      }
    } catch (error) {
      console.error('Error canceling notifications by tag:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      // Cancel all existing notifications
      await this.cancelAllNotifications();

      // Schedule based on preferences
      if (preferences.dailyReminders) {
        await this.scheduleDailyReminder(preferences.reminderTime);
      }

      if (preferences.cravingSupport) {
        await this.scheduleCravingSupportReminders();
      }

      // Achievement and target warnings are sent on-demand, not scheduled
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  /**
   * Initialize notification service
   */
  async initialize(preferences?: NotificationPreferences): Promise<boolean> {
    const hasPermission = await this.requestPermissions();

    if (hasPermission && preferences) {
      await this.updatePreferences(preferences);
    }

    return hasPermission;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
