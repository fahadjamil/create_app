import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB3QEqTN2b6TFGYzoBamzRHvwpfAwA_XaA",
  authDomain: "create-1cd84.firebaseapp.com",
  projectId: "create-1cd84",
  storageBucket: "create-1cd84.firebasestorage.app",
  messagingSenderId: "291547825714",
  appId: "1:291547825714:web:3d6bf71a6891df66b8de2b",
  measurementId: "G-DXGWE2B5Q6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);