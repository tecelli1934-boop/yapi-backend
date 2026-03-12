importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA3NQsRHqBTiResAy70I15HG3BjjWRuuhI",
  authDomain: "ramazan-seven.firebaseapp.com",
  projectId: "ramazan-seven",
  storageBucket: "ramazan-seven.firebasestorage.app",
  messagingSenderId: "1021747086297",
  appId: "1:1021747086297:web:238c03e0332e8eecee0fc8",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
