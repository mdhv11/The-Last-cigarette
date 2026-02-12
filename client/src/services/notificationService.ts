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

    scheduleCravingSupport: async () => {
        // Schedule a random check-in (e.g., in 3 hours) - simplified for now
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Stay Strong!",
                body: "Remember your reasons for quitting. You got this!",
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 60 * 60 * 3, // 3 hours
                repeats: false,
            },
        });
    },

    cancelAllNotifications: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },
};
