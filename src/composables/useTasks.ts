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

export type TaskType = "task" | "note";

export type Subtask = {
  id: string;
  title: string;
  description?: string;
  link?: string;
  dueDate?: string; // YYYY-MM-DD
  done: boolean;
};

export type Task = {
  id: string;
  userId: string;
  title: string;
  type: TaskType;      // "task" (con subtareas) o "note" (solo texto)
  description?: string; // para notas
  completed: boolean;  // solo tiene sentido si type === "task"
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
          const data = d.data() as Omit<Task, "id"> & { type?: TaskType };

          const type: TaskType = data.type ?? "task"; // compat con docs viejos
          const subtasks = Array.isArray(data.subtasks) ? data.subtasks : [];

          return {
            id: d.id,
            ...data,
            type,
            subtasks,
          } as Task;
        });

        // ordenamos por "order"
        tasks.value = raw.sort((a, b) => a.order - b.order);
      });
    },
    { immediate: true }
  );

  // Separaciones
  const tasksOnly = computed(() =>
    tasks.value.filter((t) => (t.type ?? "task") === "task")
  );

  const notes = computed(() =>
    tasks.value.filter((t) => (t.type ?? "task") === "note")
  );

  const activeTasks = computed(() =>
    tasksOnly.value.filter((t) => !t.completed)
  );

  const completedTasks = computed(() =>
    tasksOnly.value.filter((t) => t.completed)
  );

  async function createTask(payload: {
    title: string;
    type: TaskType;
    description?: string;
  }) {
    if (!user.value) return;

    const now = Timestamp.now();

    // Si es nota, completed/subtasks no tienen casi sentido, pero los guardamos igual
    await addDoc(collection(db, "tasks"), {
      userId: user.value.uid,
      title: payload.title,
      type: payload.type,
      description: payload.type === "note" ? payload.description ?? "" : null,
      completed: false,
      order: Date.now(),
      createdAt: now,
      updatedAt: now,
      subtasks: [],
    });
  }

  async function updateTask(taskId: string, payload: Partial<Task>) {
    const now = Timestamp.now();

    // Limpieza simple: quitamos undefined para no liarla con Firestore
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }

    await updateDoc(doc(db, "tasks", taskId), {
      ...cleaned,
      updatedAt: now,
    });
  }

  async function deleteTask(taskId: string) {
    await deleteDoc(doc(db, "tasks", taskId));
  }

  async function addSubtask(task: Task, subtaskInput: Omit<Subtask, "id">) {
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

  async function updateSubtask(
    task: Task,
    subtaskId: string,
    payload: Partial<Subtask>
  ) {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, ...payload } : st
    );

    await updateTask(task.id, {
      subtasks: updatedSubtasks as any,
    });
  }

  async function deleteSubtask(task: Task, subtaskId: string) {
  const updatedSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);

  const completed =
    updatedSubtasks.length > 0 &&
    updatedSubtasks.every((st) => st.done);

  await updateTask(task.id, {
    subtasks: updatedSubtasks as any,
    completed,
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
    tasksOnly,
    notes,
    activeTasks,
    completedTasks,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    uncheckAllSubtasks,
  };
}
