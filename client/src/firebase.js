import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

export const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyC-gKVXAzAM6VojalLqdUz6pDEji2LOJLw",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "srpsreport-23798.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "srpsreport-23798",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "srpsreport-23798.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "540428810185",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:540428810185:web:7b78b8dd12358fee145a18",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KR8ZPKNCY1",
};

export const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

let analyticsInstance = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((yes) => {
      if (yes) {
        analyticsInstance = getAnalytics(app);
      }
    })
    .catch(() => {});
}

export { analyticsInstance as analytics };

export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function signInWithFirebaseEmail(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function sendFirebaseReset(email) {
  return await sendPasswordResetEmail(auth, email);
}

export async function firebaseSignOut() {
  return await signOut(auth);
}
