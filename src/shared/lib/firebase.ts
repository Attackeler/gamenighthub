import { getAnalytics } from 'firebase/analytics';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDpZn91UPdoOcaURfZZ_Yoc8QNCkF2DQrg',
  authDomain: 'gamenight-db.firebaseapp.com',
  projectId: 'gamenight-db',
  storageBucket: 'gamenight-db.firebasestorage.app',
  messagingSenderId: '257562551490',
  appId: '1:257562551490:web:cd72271eaef454e74b475b',
  measurementId: 'G-HC4V1FSDKD',
};

let app;
if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  getAnalytics(app);
}

export const db = app ? getFirestore(app) : null;
