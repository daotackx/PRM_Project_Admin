const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth(); // Thêm Firebase Auth

module.exports = { db, auth };
