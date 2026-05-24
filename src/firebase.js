import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSYHLblHN5-G_0ZWkr0_xlXF_J3h8psLc",
  authDomain: "amanah-daily.firebaseapp.com",
  projectId: "amanah-daily",
  storageBucket: "amanah-daily.firebasestorage.app",
  messagingSenderId: "1003932408144",
  appId: "1:1003932408144:web:4874696508ac5706157455"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;