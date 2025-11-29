// src/composables/useAuth.ts
import { ref } from "vue";
import { auth } from "@/services/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, } from "firebase/auth";
const user = ref(null);
const loading = ref(true);
let initialized = false;
function initAuthListener() {
    if (initialized)
        return;
    initialized = true;
    onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            user.value = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
            };
        }
        else {
            user.value = null;
        }
        loading.value = false;
    });
}
async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
}
async function register(email, password) {
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
