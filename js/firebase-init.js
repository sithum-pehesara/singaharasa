// TODO: Replace this with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDqBTnByXJf_aYRpKJ6f1JbYFA4UH0QUwc",
    authDomain: "singharasa-bakery.firebaseapp.com",
    projectId: "singharasa-bakery",
    storageBucket: "singharasa-bakery.firebasestorage.app",
    messagingSenderId: "249510412020",
    appId: "1:249510412020:web:f047b56933c24ed1d6a8a1",
    measurementId: "G-B8B306E8GL"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = firebase.auth();

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();

// Optional: Use emulator for local testing (uncomment if using Firebase emulators)
// if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//     auth.useEmulator('http://localhost:9099');
//     db.useEmulator('localhost', 8080);
// }
