import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB4I81UpGfw65_v68360I7oPefaFfxJIec',
  authDomain: 'demolms-5bb67.firebaseapp.com',
  projectId: 'demolms-5bb67',
  storageBucket: 'demolms-5bb67.firebasestorage.app',
  messagingSenderId: '431046806996',
  appId: '1:431046806996:web:367c94d06ef96b842cda41',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
