import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // VAPID key from Firebase console goes here in production
      // const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY_HERE' });
      // return token;
      console.log('Notification permission granted.');
      return 'dummy-token-until-vapid-key-added';
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
