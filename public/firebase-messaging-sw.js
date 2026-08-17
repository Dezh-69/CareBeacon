// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// Note: We would ideally inject this during build, but for now we fallback to the known ID
const firebaseConfig = {
  apiKey: "AIzaSyBsO9SdlRPaWU8gnRO2BClErmqBhyBqxHI",
  authDomain: "carebeacon-41b76.firebaseapp.com",
  databaseURL: "https://carebeacon-41b76-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "carebeacon-41b76",
  storageBucket: "carebeacon-41b76.firebasestorage.app",
  messagingSenderId: "281184028965",
  appId: "1:281184028965:web:f870acb5c1f3c52940b2cc"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'CareBeacon Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'A new event requires your attention.',
    icon: '/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
