import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  GoogleAuthProvider,
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  type Auth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
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


const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);

let authInstance: Auth;
if (Platform.OS === "web") {
  authInstance = getAuth(app);
} else {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const auth: Auth = authInstance;

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: "select_account" });
