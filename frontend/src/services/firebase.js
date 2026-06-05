"use client";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app;
export let auth = null;
let googleProvider = null;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined') {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({
            prompt: "select_account"
        });
    } catch (e) {
        console.warn("Firebase initialization skipped or failed:", e);
    }
} else {
    console.warn("Firebase config is missing from .env. Google Auth will be disabled.");
}

export const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
        throw new Error("Firebase is not configured. Please use standard login or update .env.");
    }
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Google Login Error:", error);
        throw error;
    }
};