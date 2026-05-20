import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2O6S7Ge6o23AHRO8XwahUDB33ebE8CQc",
  authDomain: "bookmanaging-7d105.firebaseapp.com",
  projectId: "bookmanaging-7d105",
  storageBucket: "bookmanaging-7d105.firebasestorage.app",
  messagingSenderId: "37165731576",
  appId: "1:37165731576:web:d38d88cf4715816848b50d"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);