// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpZn91UPdoOcaURfZZ_Yoc8QNCkF2DQrg",
  authDomain: "gamenight-db.firebaseapp.com",
  projectId: "gamenight-db",
  storageBucket: "gamenight-db.firebasestorage.app",
  messagingSenderId: "257562551490",
  appId: "1:257562551490:web:cd72271eaef454e74b475b",
  measurementId: "G-HC4V1FSDKD"
};


let app;
if (typeof window !== 'undefined') {
  // Only initialize on client side
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

export const db = app ? getFirestore(app) : null;