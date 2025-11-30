import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// ⚠️ Si quieres usar analytics luego, lo vemos después.
// Por ahora me centro en Auth + Firestore.
const firebaseConfig = {

  apiKey: "AIzaSyBHIO0cp77OX4QPFM6KtfGpVpIcGVvBKeg",

  authDomain: "apptasks-49a0a.firebaseapp.com",

  projectId: "apptasks-49a0a",

  storageBucket: "apptasks-49a0a.firebasestorage.app",

  messagingSenderId: "27791176050",

  appId: "1:27791176050:web:7bdbf73fc803d17c686deb",

  measurementId: "G-5T1LSE3HK2"

};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Si más adelante quieres Analytics (solo en navegador):
// import { getAnalytics, isSupported } from "firebase/analytics";
// export const analytics = (await isSupported()) ? getAnalytics(app) : null;
