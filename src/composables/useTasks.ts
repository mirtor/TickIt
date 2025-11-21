// src/composables/useTasks.ts
import { ref, watchEffect } from "vue";
import { db } from "@/services/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "./useAuth";

const tasks = ref<any[]>([]);
let unsubscribe: null | (() => void) = null;

export function useTasks() {
  const { user } = useAuth();

  watchEffect(() => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    if (user.value) {
      const q = query(
        collection(db, "tasks"),
        where("userId", "==", user.value.uid),
        orderBy("completed"),
        orderBy("order")
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        tasks.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      });
    } else {
      tasks.value = [];
    }
  });

  async function createTask(title: string) {
    if (!user.value) return;

    await addDoc(collection(db, "tasks"), {
      userId: user.value.uid,
      title,
      completed: false,
      order: Date.now(), // por ejemplo
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      subtasks: [],
    });
  }

  async function updateTask(taskId: string, payload: any) {
    await updateDoc(doc(db, "tasks", taskId), {
      ...payload,
      updatedAt: Timestamp.now(),
    });
  }

  async function toggleSubtask(task: any, subtaskId: string) {
    const subtasks = task.subtasks.map((st: any) =>
      st.id === subtaskId ? { ...st, done: !st.done } : st
    );

    const completed =
      subtasks.length > 0 && subtasks.every((st: any) => st.done);

    await updateTask(task.id, { subtasks, completed });
  }

  async function uncheckAll(task: any) {
    const subtasks = task.subtasks.map((st: any) => ({ ...st, done: false }));
    await updateTask(task.id, { subtasks, completed: false });
  }

  return {
    tasks,
    createTask,
    updateTask,
    toggleSubtask,
    uncheckAll,
  };
}
