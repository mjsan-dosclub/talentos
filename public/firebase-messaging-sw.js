// Firebase Cloud Messaging Background Service Worker
/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForTalentOSDevFCM001",
  authDomain: "talentos-descience.firebaseapp.com",
  projectId: "talentos-descience",
  storageBucket: "talentos-descience.appspot.com",
  messagingSenderId: "103948572019",
  appId: "1:103948572019:web:abcdef123456",
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log("[TalentOS FCM SW] Background message received:", payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || "TalentOS Announcement";
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || "New update from DeScience Open Source Club",
      icon: payload.notification?.icon || "/dos-club-logo.png",
      badge: "/favicon.ico",
      data: {
        url: payload.data?.url || "/checkin",
      },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (err) {
  console.warn("[TalentOS FCM SW] Initializer warning:", err);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/checkin";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
