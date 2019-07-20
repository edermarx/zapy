const firebase = require('firebase');
require('dotenv').config();

firebase.initializeApp({
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "zapy-ea861.firebaseapp.com",
  databaseURL: "https://zapy-ea861.firebaseio.com",
  projectId: "zapy-ea861",
  storageBucket: "",
  messagingSenderId: "303832411484",
  appId: "1:303832411484:web:29e2b4900f3b0a89"
});

module.exports = {
  db: firebase.database(),
  token: process.env.FIREBASE_TOKEN,
};