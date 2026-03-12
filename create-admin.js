import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

async function createAdmin() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, "admin@test.com", "admin123");
    const user = userCredential.user;
    
    await setDoc(doc(db, "users", user.uid), {
      name: "Sistem Yöneticisi",
      email: "admin@test.com",
      role: "admin",
      createdAt: new Date().toISOString()
    });
    
    console.log("Admin account created successfully!");
    console.log("Email: admin@test.com");
    console.log("Password: admin123");
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("Account already exists. I need to update the role to admin.");
      // We can't easily get the UID by email without admin SDK, so let's just create a unique one
      const uniqueEmail = `admin-${Date.now()}@test.com`;
      console.log("Creating alternative admin:", uniqueEmail);
      const newCred = await createUserWithEmailAndPassword(auth, uniqueEmail, "admin123");
      await setDoc(doc(db, "users", newCred.user.uid), {
        name: "Sistem Yöneticisi",
        email: uniqueEmail,
        role: "admin",
        createdAt: new Date().toISOString()
      });
      console.log("Alternative admin created!");
      console.log("Email:", uniqueEmail);
      console.log("Password: admin123");
    } else {
      console.error("Error creating admin:", error);
    }
  }
}

createAdmin().then(() => process.exit(0));
