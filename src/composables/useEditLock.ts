import { db } from "@/services/firebase";
import { useAuth } from "@/composables/useAuth";
import { doc, onSnapshot, runTransaction, serverTimestamp, Timestamp } from "firebase/firestore";
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

    if (ok) {
      if (!hb) {
        hb = window.setInterval(async () => {
          if (!hasLock.value || !user.value) return;
          const now = Date.now();
          const newExp = Timestamp.fromMillis(now + LOCK_TTL_MS);
          try {
            await runTransaction(db, async (tx) => {
              const snap = await tx.get(lockRef);
              if (!snap.exists()) return;
              const data = snap.data() as any;
              if (data.holderUid !== user.value!.uid) return;
              tx.set(lockRef, { holderUid: user.value!.uid, holderEmail: user.value!.email ?? "", expiresAt: newExp, updatedAt: serverTimestamp() });
            });
          } catch {}
        }, HEARTBEAT_MS);
      }
    }

    return ok;
  }

  async function release() {
    if (!user.value) return;
    if (hb) {
      window.clearInterval(hb);
      hb = null;
    }
    if (!hasLock.value) return;

    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(lockRef);
        if (!snap.exists()) return;
        const data = snap.data() as any;
        if (data.holderUid !== user.value!.uid) return;
        tx.delete(lockRef);
      });
    } catch {}
  }

  function dispose() {
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
