import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSYHlblHN5-G_OZWkr0_xlXF_J3h8psLc",
  authDomain: "amanah-daily.firebaseapp.com",
  projectId: "amanah-daily",
  storageBucket: "amanah-daily.firebasestorage.app",
  messagingSenderId: "1003932408144",
  appId: "1:1003932408144:web:4874696580ac5706157455"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);