// src/composables/useAuth.ts
import { ref, onMounted } from "vue";
import { auth } from "@/services/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const user = ref<null | { uid: string; email: string | null }>(null);
const loading = ref(true);

export function useAuth() {
  onMounted(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        };
      } else {
        user.value = null;
      }
      loading.value = false;
    });
  });

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
}
