const firebase = require('firebase');

firebase.initializeApp({
  apiKey: "AIzaSyBoiW68byteYX26Q6M_z2A_Gx_edIIS63Y",
  authDomain: "zapy-ea861.firebaseapp.com",
  databaseURL: "https://zapy-ea861.firebaseio.com",
  projectId: "zapy-ea861",
  storageBucket: "",
  messagingSenderId: "303832411484",
  appId: "1:303832411484:web:29e2b4900f3b0a89"
});

module.exports = {
  db: firebase.database(),
  token: '016d65cdd5a9ba22ad76a5f304ad1cfa6f8e89e4640aa2e4b35c7ff588d2d3ba',
};