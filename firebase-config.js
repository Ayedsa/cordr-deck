// Firebase Configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3fdtpnz8E6SRBIIFeu6sBOGcDYbw8pLk",
  authDomain: "cordr11.firebaseapp.com",
  databaseURL: "https://cordr11-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cordr11",
  storageBucket: "cordr11.firebasestorage.app",
  messagingSenderId: "251053218045",
  appId: "1:251053218045:web:c7c956008cbab219af0694",
  measurementId: "G-671QL4HH5W"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase, ref, set, get, child } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, ref, set, get, child };

