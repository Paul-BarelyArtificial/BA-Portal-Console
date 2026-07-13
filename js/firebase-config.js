/*
==================================================
BA Console Firebase Configuration
Project : Barely Artificial Portal
==================================================

Firebase web configuration is intentionally public in a browser app.
Access is controlled by Firebase Authentication and security rules.
*/

const firebaseConfig = {
  apiKey: "AIzaSyBPOUDq86fXm1uF87gIFNA-BbAuX2jLbJE",
  authDomain: "barely-artificial-portal.firebaseapp.com",
  projectId: "barely-artificial-portal",
  storageBucket: "barely-artificial-portal.firebasestorage.app",
  messagingSenderId: "445309237693",
  appId: "1:445309237693:web:e36e7ac80678b8f7323ad4"
};

firebase.initializeApp(firebaseConfig);
