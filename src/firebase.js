import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCl9Q1Qd5woxohSb6-_t5rCSr8hXty4qOg",
  authDomain: "phoenix-acaea.firebaseapp.com",
  projectId: "phoenix-acaea",
  storageBucket: "phoenix-acaea.appspot.com",
  messagingSenderId: "307735625625",
  appId: "1:307735625625:web:56f3b2652b0eef361f1d08"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();