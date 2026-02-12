import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const notificationService = {
    registerForPushNotificationsAsync: async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            // For local notifications we don't strictly need the token, but good to have for future remote push
            // token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig?.extra?.eas?.projectId })).data;
        } else {
            // alert('Must use physical device for Push Notifications');
        }

        return token;
    },

    scheduleDailyReminder: async () => {
        // Cancel existing reminders to avoid duplicates
        await notificationService.cancelAllNotifications();

        // Schedule for 8:00 PM every day
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Daily Check-in",
                body: "Don't forget to log your progress today!",
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                hour: 20,
                minute: 0,
                repeats: true,
            },
        });
    },

    scheduleCravingSupport: async (times: string[]) => {
        // Cancel existing craving support notifications (simplified: canceling all for now)
        // ideally we track IDs, but for this MVP, cancelAll is safer
        await notificationService.cancelAllNotifications();

        // Re-schedule daily reminder as we just cancelled everything
        await notificationService.scheduleDailyReminder();

        for (const time of times) {
            const [hourStr, minuteStr] = time.split(':');
            const hour = parseInt(hourStr);
            const minute = parseInt(minuteStr);

            if (!isNaN(hour) && !isNaN(minute)) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Check-in Time",
                        body: "Take a moment to breathe. How are you feeling?",
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                        hour: hour,
                        minute: minute,
                        repeats: true,
                    },
                });
            }
        }
    },

    cancelAllNotifications: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },
};
