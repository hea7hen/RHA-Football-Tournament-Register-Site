"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { initializeFirestore, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQbyqHP1AOi7SD4_tORxFwVkpOyjlpJXs",
  authDomain: "rha-football-a22dd.firebaseapp.com",
  projectId: "rha-football-a22dd",
  storageBucket: "rha-football-a22dd.firebasestorage.app",
  messagingSenderId: "187144097239",
  appId: "1:187144097239:web:90811320b75aa891eecf92",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Fix Firestore WebChannel 400s on some networks by auto-detecting long polling
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
export const googleProvider = new GoogleAuthProvider();
export const firebaseServerTimestamp = serverTimestamp;

export async function signInWithGooglePopup(): Promise<void> {
  await signInWithPopup(auth, googleProvider);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}


