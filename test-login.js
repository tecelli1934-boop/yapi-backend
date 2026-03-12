import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3NQsRHqBTiResAy70I15HG3BjjWRuuhI",
  authDomain: "ramazan-seven.firebaseapp.com",
  projectId: "ramazan-seven",
  storageBucket: "ramazan-seven.firebasestorage.app",
  messagingSenderId: "1021747086297",
  appId: "1:1021747086297:web:238c03e0332e8eecee0fc8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testLogin() {
  console.log("Testing Login...");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, "admin@test.com", "admin123");
    const user = userCredential.user;
    
    console.log("Auth Success. UID:", user.uid);
    console.log("Email Verified:", user.emailVerified);
    
    console.log("Fetching role from Firestore...");
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      console.log("User Data:", userDoc.data());
    } else {
      console.log("No extra data found for user:", user.uid);
    }
  } catch (error) {
    console.error("Login Failed:", error.code, error.message);
  }
}

testLogin().then(() => process.exit(0));
