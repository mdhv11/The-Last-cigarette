import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-notifications';

/**
 * Hook to handle notification responses and navigation
 */
export const useNotifications = () => {
  const navigation = useNavigation<any>();
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {
    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        
        // Navigate based on notification type
        switch (data.type) {
          case 'daily-reminder':
            navigation.navigate('Home');
            break;
          case 'achievement':
            navigation.navigate('Achievements');
            break;
          case 'target-warning':
            navigation.navigate('Home');
            break;
          case 'craving-support':
            navigation.navigate('Home');
            break;
          case 'milestone':
            navigation.navigate('Progress');
            break;
          default:
            navigation.navigate('Home');
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [navigation]);
};
