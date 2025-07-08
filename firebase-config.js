// Firebase configuration and initialization

// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getDatabase, ref, set, get, push, remove, child, onValue, off } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Export for use in other files
export { 
  auth, 
  database, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  ref, 
  set, 
  get, 
  push, 
  remove, 
  child, 
  onValue, 
  off 
};

