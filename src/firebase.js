import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyA3NQsRHqBTiResAy70I15HG3BjjWRuuhI",
  authDomain: "ramazan-seven.firebaseapp.com",
  projectId: "ramazan-seven",
  storageBucket: "ramazan-seven.firebasestorage.app",
  messagingSenderId: "1021747086297",
  appId: "1:1021747086297:web:238c03e0332e8eecee0fc8",
  measurementId: "G-Z5D3HMTE66"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export const googleProvider = new GoogleAuthProvider();

export { getToken, onMessage };
export default app;
