import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0O5_qnShmO0ayvapEMLLou9-tFE9gzN4",
  authDomain: "online-couns.firebaseapp.com",
  projectId: "online-couns",
  storageBucket: "online-couns.firebasestorage.app",
  messagingSenderId: "466481271168",
  appId: "1:466481271168:web:af1a04cad1ba9203f77165"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = firebase.auth();