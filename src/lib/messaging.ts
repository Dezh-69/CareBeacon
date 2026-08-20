import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.warn('Notification permission granted, but no VITE_FIREBASE_VAPID_KEY found in environment. Using dummy token.');
        return 'dummy-token-until-vapid-key-added';
      }

      console.log('Notification permission granted. Getting FCM token...');
      const token = await getToken(messaging, { vapidKey });
      return token;
    }
    return null;
  } catch (error) {
    console.error('An error occurred while requesting permission ', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
