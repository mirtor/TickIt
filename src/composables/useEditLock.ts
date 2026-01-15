import { db } from "@/services/firebase";
import { useAuth } from "@/composables/useAuth";
import { doc, onSnapshot, runTransaction, serverTimestamp, Timestamp, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { ref } from "vue";

const LOCK_TTL_MS = 60_000;
const HEARTBEAT_MS = 25_000;

export function useEditLock(taskId: string) {
  const { user } = useAuth();
  const lockRef = doc(db, "tasks", taskId, "locks", "edit");

  const hasLock = ref(false);
  const isLockedByOther = ref(false);
  const lockedByEmail = ref<string | null>(null);

  let unsub: null | (() => void) = null;
  let hb: number | null = null;
  let stopping = false;

  function startListener() {
    if (unsub) return;
    unsub = onSnapshot(lockRef, (snap) => {
      if (!snap.exists()) {
        hasLock.value = false;
        isLockedByOther.value = false;
        lockedByEmail.value = null;
        return;
      }

      const data = snap.data() as any;
      const now = Date.now();
      const exp = data.expiresAt?.toMillis?.() ?? 0;
      const expired = exp <= now;

      const me = user.value?.uid;
      const holderUid = data.holderUid as string | undefined;
      const holderEmail = data.holderEmail as string | undefined;

      if (expired) {
        hasLock.value = false;
        isLockedByOther.value = false;
        lockedByEmail.value = null;
        return;
      }

      hasLock.value = !!me && holderUid === me;
      isLockedByOther.value = !!me && holderUid !== me;
      lockedByEmail.value = holderEmail ?? null;
    });
  }

  async function acquire(): Promise<boolean> {
    if (!user.value) return false;
    stopping = false;
    startListener();

    const meUid = user.value.uid;
    const meEmail = user.value.email ?? "";

    const ok = await runTransaction(db, async (tx) => {
      const snap = await tx.get(lockRef);
      const now = Date.now();
      const newExp = Timestamp.fromMillis(now + LOCK_TTL_MS);

      if (!snap.exists()) {
        tx.set(lockRef, { holderUid: meUid, holderEmail: meEmail, expiresAt: newExp, updatedAt: serverTimestamp() });
        return true;
      }

      const data = snap.data() as any;
      const exp = data.expiresAt?.toMillis?.() ?? 0;
      const expired = exp <= now;
      const holderUid = data.holderUid as string | undefined;

      if (expired || holderUid === meUid) {
        tx.set(lockRef, { holderUid: meUid, holderEmail: meEmail, expiresAt: newExp, updatedAt: serverTimestamp() });
        return true;
      }

      return false;
    });

    if (ok && !hb) {
      hb = window.setInterval(async () => {
        if (stopping) return;
        if (!user.value) return;
        if (!hasLock.value) return;

        const now = Date.now();
        const newExp = Timestamp.fromMillis(now + LOCK_TTL_MS);

        try {
          // Evita transacción aquí: reduce conflictos y quita precondiciones de commit.
          await updateDoc(lockRef, { expiresAt: newExp, updatedAt: serverTimestamp() });
        } catch {
          // Si falla (lock borrado, permisos, etc.), paramos heartbeat.
          if (hb) {
            window.clearInterval(hb);
            hb = null;
          }
        }
      }, HEARTBEAT_MS);
    }

    return ok;
  }

  async function release() {
    stopping = true;

    if (hb) {
      window.clearInterval(hb);
      hb = null;
    }

    // Best-effort: delete directo (sin transaction) para evitar failed-precondition.
    // La regla de Firestore debe impedir que borre otro que no sea holderUid.
    try {
      await deleteDoc(lockRef);
    } catch {}
  }

  function dispose() {
    stopping = true;

    if (hb) {
      window.clearInterval(hb);
      hb = null;
    }
    if (unsub) {
      unsub();
      unsub = null;
    }
  }

  return { hasLock, isLockedByOther, lockedByEmail, startListener, acquire, release, dispose };
}
