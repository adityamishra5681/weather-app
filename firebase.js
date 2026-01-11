// --- 1. Import Firebase SDKs ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 2. Your Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAm5cZfnsn-H1GC-XSIh9b-SY3AeidkHic",
  authDomain: "weather-app-14b1b.firebaseapp.com",
  projectId: "weather-app-14b1b",
  storageBucket: "weather-app-14b1b.firebasestorage.app",
  messagingSenderId: "253973957194",
  appId: "1:253973957194:web:33e20637dc463e3eafb4b3",
  measurementId: "G-7Z10SXWB7T"
};

// --- 3. Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- 4. The Bridge: Expose functions to your main script ---
// Your main.js looks for "window.auth", "window.db", etc.
window.auth = auth;
window.db = db;
window.googleProvider = provider;
window.googleSignIn = signInWithPopup;
window.signIn = signInWithEmailAndPassword;
window.createUser = createUserWithEmailAndPassword;
window.logout = signOut;
window.userState = onAuthStateChanged;
window.dbSet = setDoc;
window.dbGet = getDoc;
window.dbDoc = doc;

// Tell the main script that Firebase is ready
window.firebaseReady = true;

console.log("Firebase initialized and connected to Weather App 14B1B");
