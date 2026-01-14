import { computed, ref, watch } from "vue";
import { db } from "@/services/firebase";
import { addDoc, collection, deleteDoc, getDoc, doc, onSnapshot, query, Timestamp, updateDoc, where, collectionGroup } from "firebase/firestore";
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

export type CreateTaskPayload = {
  title: string;
  type: TaskType;
  description?: string;
};

export type TaskUpdatePayload = Partial<Pick<Task, "title" | "type" | "description" | "completed" | "order" | "subtasks">>;

export type SubtaskInput = {
  title: string;
  done?: boolean;
  description?: string;
  link?: string;
  dueDate?: string;
};

// Estado global reactivo
const tasks = ref<Task[]>([]);

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
  let unsubSharedMembers: (() => void) | null = null;

  // listeners por task compartida
  const sharedTaskUnsubs = new Map<string, () => void>();

  // caches locales
  let ownTasksLocal: Task[] = [];
  const sharedTasksMap = new Map<string, Task>();

  function syncFinalTasks() {
    const map = new Map<string, Task>();
    // prioridad: propias, luego compartidas (no debería haber colisión real, pero lo mantenemos estable)
    ownTasksLocal.forEach((t) => map.set(t.id, t));
    sharedTasksMap.forEach((t, id) => {
      if (!map.has(id)) map.set(id, t);
    });

    tasks.value = Array.from(map.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  function clearSharedTaskListeners() {
    sharedTaskUnsubs.forEach((u) => u());
    sharedTaskUnsubs.clear();
    sharedTasksMap.clear();
  }

  watch(
    () => user.value?.uid,
    (uid) => {
      unsubOwn?.();
      unsubSharedMembers?.();
      clearSharedTaskListeners();

      if (!uid) {
        tasks.value = [];
        ownTasksLocal = [];
        return;
      }

      // --- PROPIAS (tiempo real) ---
      const ownQuery = query(collection(db, "tasks"), where("userId", "==", uid));
      unsubOwn = onSnapshot(
        ownQuery,
        (snap) => {
          ownTasksLocal = snap.docs.map((d) => ({ ...(d.data() as Task), id: d.id }));
          syncFinalTasks();
        },
        (err) => console.error("Error en tareas propias:", err)
      );

      // --- COMPARTIDAS: 1) escuchar MEMBERS, 2) por cada taskId escuchar TASK DOC (tiempo real) ---
      const sharedMembersQuery = query(collectionGroup(db, "members"), where("uid", "==", uid));

      unsubSharedMembers = onSnapshot(
        sharedMembersQuery,
        (snap) => {
          const nextIds = new Set<string>();

          for (const d of snap.docs) {
            const taskId = d.ref.parent.parent?.id;
            if (taskId) nextIds.add(taskId);
          }

          // quitar listeners de ids que ya no están
          for (const existingId of Array.from(sharedTaskUnsubs.keys())) {
            if (!nextIds.has(existingId)) {
              sharedTaskUnsubs.get(existingId)?.();
              sharedTaskUnsubs.delete(existingId);
              sharedTasksMap.delete(existingId);
            }
          }

          // añadir listeners nuevos
          for (const id of Array.from(nextIds)) {
            if (sharedTaskUnsubs.has(id)) continue;

            const taskRef = doc(db, "tasks", id);
            const unsub = onSnapshot(
              taskRef,
              (taskSnap) => {
                if (!taskSnap.exists()) {
                  sharedTasksMap.delete(id);
                } else {
                  sharedTasksMap.set(id, { ...(taskSnap.data() as Task), id: taskSnap.id });
                }
                syncFinalTasks();
              },
              (err) => console.error("Error escuchando task compartida:", id, err)
            );

            sharedTaskUnsubs.set(id, unsub);
          }

          syncFinalTasks();
        },
        (err) => console.error("Error en el listener de compartidas (Collection Group):", err)
      );
    },
    { immediate: true }
  );

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

  async function addSubtask(task: Task, input: SubtaskInput) {
    const desc = input.description?.trim();
    const link = input.link?.trim();
    const due = input.dueDate?.trim();

    const newSub: Subtask = {
      id: crypto.randomUUID(),
      title: input.title,
      done: !!input.done,
      ...(desc ? { description: desc } : {}),
      ...(link ? { link } : {}),
      ...(due ? { dueDate: due } : {}),
    };

    const subtasks = [...(task.subtasks || []), newSub];
    const completed = subtasks.length > 0 && subtasks.every((s) => s.done);

    await updateTask(task.id, { subtasks, completed });
  }

  async function updateSubtask(task: Task, subId: string, payload: Partial<Subtask>) {
    const subtasks = task.subtasks.map((s) => (s.id === subId ? { ...s, ...cleanUndefined(payload) } : s));
    const completed = subtasks.length > 0 && subtasks.every((s) => s.done);
    await updateTask(task.id, { subtasks, completed });
  }

  async function deleteSubtask(task: Task, subId: string) {
    const subtasks = task.subtasks.filter((s) => s.id !== subId);
    const completed = subtasks.length > 0 && subtasks.every((s) => s.done);
    await updateTask(task.id, { subtasks, completed });
  }

  async function toggleSubtask(task: Task, subId: string) {
    const subtasks = task.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s));
    const completed = subtasks.length > 0 && subtasks.every((s) => s.done);
    await updateTask(task.id, { subtasks, completed });
  }

  async function uncheckAllSubtasks(task: Task) {
    const subtasks = task.subtasks.map((s) => ({ ...s, done: false }));
    await updateTask(task.id, { subtasks, completed: false });
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
