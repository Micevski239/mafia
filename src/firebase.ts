import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// TODO: Replace with your Firebase project configuration
// Get these values from Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: "AIzaSyAQBXOaLJaK5N09dhxCoY1F2k1DwjewQeA",
  authDomain: "mafia-invitation.firebaseapp.com",
  databaseURL: "https://mafia-invitation-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mafia-invitation",
  storageBucket: "mafia-invitation.firebasestorage.app",
  messagingSenderId: "64265033158",
  appId: "1:64265033158:web:0b2cce4ce998fb5dd94ec7",
  measurementId: "G-KJNTVFGR7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app)
