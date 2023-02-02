// Import the functions you need from the SDKs you need
const initializeApp = require('firebase/app').initializeApp;
const getAnalytics = require('firebase/analytics').getAnalytics;
const getAuth = require('firebase/auth').getAuth;
const getDatabase = require('firebase/database').getDatabase;
require('dotenv').config();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId,
  databaseURL: process.env.databaseURL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
exports.auth = getAuth(app);
exports.database =  getDatabase(app)