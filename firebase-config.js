// firebase-config.js
// SysSPS – Firebase
// Versão: v2.0.0

const firebaseConfig = {
  apiKey: "AIzaSyAeCrURSs0TBXlYF3TKLi4q98VwrGaKe_Q",
  authDomain: "spsch-849e5.firebaseapp.com",
  databaseURL: "https://spsch-849e5-default-rtdb.firebaseio.com",
  projectId: "spsch-849e5",
  storageBucket: "spsch-849e5.firebasestorage.app",
  messagingSenderId: "698967090558",
  appId: "1:698967090558:web:978781fd27b86c36203f2f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

console.log("🔥 Firebase inicializado (v2.0.0)");

