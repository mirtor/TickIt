// src/composables/useTasks.ts
import { computed, ref, watch } from "vue";
import { db } from "@/services/firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "./useAuth";

export type Subtask = {
  id: string;
  title: string;
  description?: string;
  link?: string;
  dueDate?: string; // formato YYYY-MM-DD (opcional)
  done: boolean;
};

export type Task = {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  subtasks: Subtask[];
};

const tasks = ref<Task[]>([]);
let unsubscribe: Unsubscribe | null = null;

export function useTasks() {
  const { user } = useAuth();

  watch(
    () => user.value?.uid,
    (uid) => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }

      if (!uid) {
        tasks.value = [];
        return;
      }

      const q = query(
        collection(db, "tasks"),
        where("userId", "==", uid)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const raw = snapshot.docs.map((d) => {
          const data = d.data() as Omit<Task, "id">;
          return { id: d.id, ...data };
        });

        // ordenamos en cliente por "order"
        tasks.value = raw.sort((a, b) => a.order - b.order);
      });
    },
    { immediate: true }
  );

  const activeTasks = computed(() =>
    tasks.value.filter((t) => !t.completed)
  );

  const completedTasks = computed(() =>
    tasks.value.filter((t) => t.completed)
  );

  async function createTask(title: string) {
    if (!user.value) return;

    const now = Timestamp.now();

    await addDoc(collection(db, "tasks"), {
      userId: user.value.uid,
      title,
      completed: false,
      order: Date.now(), // se usará para ordenar por creación
      createdAt: now,
      updatedAt: now,
      subtasks: [],
    });
  }

  async function updateTask(taskId: string, payload: Partial<Task>) {
    const now = Timestamp.now();

    await updateDoc(doc(db, "tasks", taskId), {
      ...payload,
      updatedAt: now,
    });
  }

  async function deleteTask(taskId: string) {
    await deleteDoc(doc(db, "tasks", taskId));
  }

  async function addSubtask(task: Task, subtaskInput: Omit<Subtask, "id">) {
    // Construimos la subtarea sin undefined
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: subtaskInput.title,
      done: !!subtaskInput.done,
    };

    if (subtaskInput.description && subtaskInput.description.trim()) {
      newSubtask.description = subtaskInput.description.trim();
    }
    if (subtaskInput.link && subtaskInput.link.trim()) {
      newSubtask.link = subtaskInput.link.trim();
    }
    if (subtaskInput.dueDate && subtaskInput.dueDate.trim()) {
      newSubtask.dueDate = subtaskInput.dueDate.trim();
    }

    const currentSubtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    const updatedSubtasks = [...currentSubtasks, newSubtask];

    await updateTask(task.id, {
      subtasks: updatedSubtasks as any,
      completed:
        updatedSubtasks.length > 0 &&
        updatedSubtasks.every((st) => st.done),
    });
  }


  async function toggleSubtask(task: Task, subtaskId: string) {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, done: !st.done } : st
    );

    const completed =
      updatedSubtasks.length > 0 &&
      updatedSubtasks.every((st) => st.done);

    await updateTask(task.id, {
      subtasks: updatedSubtasks as any,
      completed,
    });
  }

  async function uncheckAllSubtasks(task: Task) {
    const updatedSubtasks = task.subtasks.map((st) => ({
      ...st,
      done: false,
    }));

    await updateTask(task.id, {
      subtasks: updatedSubtasks as any,
      completed: false,
    });
  }

  return {
    tasks,
    activeTasks,
    completedTasks,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    uncheckAllSubtasks,
  };
}
