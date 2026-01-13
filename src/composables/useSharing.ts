// src/composables/useSharing.ts
import { db } from "@/services/firebase";
import { useAuth } from "@/composables/useAuth";
import { doc, setDoc, addDoc, collection, serverTimestamp, getDocs, query, where, deleteDoc,} from "firebase/firestore"; 
import type { Task } from "@/composables/useTasks";
import { updateDoc } from "firebase/firestore";

export function useSharing() {
  const { user } = useAuth();

  function getCurrentUser() {
    if (!user.value) {
      throw new Error("User not authenticated");
    }
    return {
      uid: user.value.uid,
      email: user.value.email ?? "",
    };
  }

  // Resolver email -> uid
  async function resolveEmailToUid(email: string): Promise<string | null> {
    const q = query(
      collection(db, "users"),
      where("email", "==", email)
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;

    return snap.docs[0].id;
  }

  // Compartir una tarea o nota con otro usuario
  async function shareItem(
    item: Task,
    targetUid: string,
    targetEmail: string
  ) {
    const { uid: currentUid, email: currentEmail } = getCurrentUser();

    // Crear member
    await setDoc(
        doc(db, "tasks", item.id, "members", targetUid),
        {
            uid: targetUid,
            email: targetEmail,
            role: "viewer",
            canEdit: false,
            canDelete: false,
            canShare: false,
            addedAt: serverTimestamp(),
            addedBy: currentUid,
            addedByEmail: currentEmail,
        }
      );

    // Crear notificación
    await addDoc(
      collection(db, "users", targetUid, "notifications"),
      {
        type: "share",
        fromUid: currentUid,
        fromEmail: currentEmail,
        itemId: item.id,
        itemType: item.type,
        itemTitle: item.title,
        read: false,
        createdAt: serverTimestamp(),
      }
    );
  }

  // Marcar notificación como leída
  async function markNotificationAsRead(notificationId: string) {
    const { uid: currentUid } = getCurrentUser();
    const notifRef = doc(db, "users", currentUid, "notifications", notificationId);

    await updateDoc(notifRef, { read: true });
  }
  
    // Obtener la lista de miembros de una tarea
    async function getTaskMembers(taskId: string) {
    const membersRef = collection(db, "tasks", taskId, "members");
    const snap = await getDocs(membersRef);
    return snap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
    }));
    }

    // Dejar de compartir con un usuario
    async function removeMember(taskId: string, targetUid: string) {
    const memberDocRef = doc(db, "tasks", taskId, "members", targetUid);
    await deleteDoc(memberDocRef);
    }


  return {
    shareItem,
    markNotificationAsRead,
    resolveEmailToUid,
    getTaskMembers,
    removeMember,
  };
}
