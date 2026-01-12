import { computed, ref, watch } from "vue";
import { db } from "@/services/firebase";
import {addDoc, collection, deleteDoc, getDoc, doc, onSnapshot, query, Timestamp, updateDoc, where, collectionGroup,} from "firebase/firestore";

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

  let unsubOwn: (() => void) | null = null;
  let unsubShared: (() => void) | null = null;

  watch(
  () => user.value?.uid,
  (uid) => {
    // limpiar listeners previos
    unsubOwn?.();
    unsubShared?.();
    unsubOwn = null;
    unsubShared = null;

    if (!uid) {
      tasks.value = [];
      return;
    }

    // TAREAS PROPIAS
    const ownQuery = query(
      collection(db, "tasks"),
      where("userId", "==", uid)
    );

    unsubOwn = onSnapshot(ownQuery, (snap) => {
      const own = snap.docs.map((d) => ({
        ...(d.data() as Task),
        id: d.id,
      }));
      mergeTasks(own);
    });

    // TAREAS COMPARTIDAS (por members)
    const membersQuery = query(
      collection(db, "tasks", "__dummy__", "members"), // solo para tipo
      where("uid", "==", uid)
    );

    // Firestore NO permite esto directamente → usamos collectionGroup
    const sharedQuery = query(
      collectionGroup(db, "members"),
      where("uid", "==", uid)
    );

    unsubShared = onSnapshot(sharedQuery, async (snap) => {
      const taskIds = snap.docs.map((d) => d.ref.parent.parent?.id).filter(Boolean);

      if (!taskIds.length) return;

      const sharedTasks: Task[] = [];

      for (const id of taskIds) {
        const docRef = doc(db, "tasks", id!);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          sharedTasks.push({
            ...(snap.data() as Task),
            id: snap.id,
          });
        }
      }

      mergeTasks(sharedTasks);
    });
  },
  { immediate: true }
);

// Une tareas propias + compartidas sin duplicados
function mergeTasks(incoming: Task[]) {
  const map = new Map(tasks.value.map((t) => [t.id, t]));
  incoming.forEach((t) => map.set(t.id, t));
  tasks.value = Array.from(map.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

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
