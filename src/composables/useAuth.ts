// src/composables/useAuth.ts
import { ref } from "vue";
import { auth } from "@/services/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/services/firebase";

type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

const user = ref<AuthUser | null>(null);
const loading = ref(true);
let initialized = false;

function initAuthListener() {
  if (initialized) return;
  initialized = true;

  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      console.log("UID LOGUEADO:", firebaseUser.uid);

      // Guardar / actualizar usuario en Firestore
      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
            email: firebaseUser.email,
            uid: firebaseUser.uid, 
            lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      };
    } else {
      console.log("NO HAY USUARIO LOGUEADO");
      user.value = null;
    }

    loading.value = false;
  });
}


async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
}

async function register(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password);
}

async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
}

async function logout() {
    await signOut(auth);
}

export function useAuth() {
    initAuthListener();
    return {
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
    };
}
