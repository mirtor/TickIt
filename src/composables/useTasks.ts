import { computed, ref, watch } from "vue";
import { db } from "@/services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "./useAuth";

export type TaskType = "task" | "note";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  description?: string;
  link?: string;
  dueDate?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  type: TaskType;
  description?: string | null;
  completed: boolean;
  order?: number;
  subtasks: Subtask[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/** Payloads de escritura más controlados */
export type CreateTaskPayload = {
  title: string;
  type: TaskType;
  description?: string;
};

export type TaskUpdatePayload = Partial<
  Pick<Task, "title" | "type" | "description" | "completed" | "order" | "subtasks">
>;

export type SubtaskInput = {
  title: string;
  done?: boolean;
  description?: string;
  link?: string;
  dueDate?: string;
};

const tasks = ref<Task[]>([]);
let unsubscribe: null | (() => void) = null;

/** Quita campos undefined para evitar error de Firestore */
function cleanUndefined<T extends Record<string, unknown>>(obj?: T) {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj || {})) {
    if (value !== undefined) cleaned[key] = value;
  }
  return cleaned as Partial<T>;
}

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

      const q = query(collection(db, "tasks"), where("userId", "==", uid));

      unsubscribe = onSnapshot(q, (snapshot) => {
        const raw: Task[] = snapshot.docs.map((d) => {
          const data = d.data() as Partial<Task> & { subtasks?: unknown };

          const type = (data.type ?? "task") as TaskType;
          const subtasks = Array.isArray(data.subtasks) ? (data.subtasks as Subtask[]) : [];

          return {
            id: d.id,
            userId: data.userId ?? uid,
            title: data.title ?? "",
            type,
            description: data.description ?? (type === "note" ? "" : null),
            completed: !!data.completed,
            order: data.order ?? 0,
            subtasks,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });

        // orden estable por "order"
        tasks.value = raw.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      });
    },
    { immediate: true }
  );

  // Separaciones
  const tasksOnly = computed(() => tasks.value.filter((t) => t.type === "task"));
  const notes = computed(() => tasks.value.filter((t) => t.type === "note"));
  const activeTasks = computed(() => tasksOnly.value.filter((t) => !t.completed));
  const completedTasks = computed(() => tasksOnly.value.filter((t) => t.completed));

  async function createTask(payload: CreateTaskPayload) {
    if (!user.value) return;

    const now = Timestamp.now();

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

  async function updateTask(taskId: string, payload: TaskUpdatePayload) {
    const now = Timestamp.now();
    const cleaned = cleanUndefined(payload);

    await updateDoc(doc(db, "tasks", taskId), {
      ...cleaned,
      updatedAt: now,
    });
  }

  async function deleteTask(taskId: string) {
    await deleteDoc(doc(db, "tasks", taskId));
  }

  async function addSubtask(task: Task, subtaskInput: SubtaskInput) {
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: subtaskInput.title,
      done: !!subtaskInput.done,
      ...(subtaskInput.description?.trim()
        ? { description: subtaskInput.description.trim() }
        : {}),
      ...(subtaskInput.link?.trim() ? { link: subtaskInput.link.trim() } : {}),
      ...(subtaskInput.dueDate?.trim()
        ? { dueDate: subtaskInput.dueDate.trim() }
        : {}),
    };

    const currentSubtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    const updatedSubtasks = [...currentSubtasks, newSubtask];

    const completed =
      updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.done);

    await updateTask(task.id, {
      subtasks: updatedSubtasks,
      completed,
    });
  }

  async function updateSubtask(
    task: Task,
    subtaskId: string,
    payload: Partial<Subtask>
  ) {
    const cleaned = cleanUndefined(payload);

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, ...cleaned } : st
    );

    const completed =
      updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.done);

    await updateTask(task.id, {
      subtasks: updatedSubtasks,
      completed,
    });
  }

  async function deleteSubtask(task: Task, subtaskId: string) {
    const updatedSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);

    const completed =
      updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.done);

    await updateTask(task.id, {
      subtasks: updatedSubtasks,
      completed,
    });
  }

  async function toggleSubtask(task: Task, subtaskId: string) {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, done: !st.done } : st
    );

    const completed =
      updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.done);

    await updateTask(task.id, {
      subtasks: updatedSubtasks,
      completed,
    });
  }

  async function uncheckAllSubtasks(task: Task) {
    const updatedSubtasks = task.subtasks.map((st) => ({
      ...st,
      done: false,
    }));

    await updateTask(task.id, {
      subtasks: updatedSubtasks,
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
