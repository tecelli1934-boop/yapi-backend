const admin = require('firebase-admin');

// Firebase Admin SDK'yi başlat (Environment Variables ile)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = admin.firestore();

module.exports = {
  admin,
  db,
  auth: admin.auth()
};
