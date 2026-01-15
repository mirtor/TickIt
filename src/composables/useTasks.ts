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
  let unsubMembers: (() => void) | null = null;

  let ownTasksLocal: Task[] = [];
  const sharedMap = new Map<string, Task>();
  const sharedUnsubs = new Map<string, () => void>();

  function syncFinalTasks() {
    const map = new Map<string, Task>();
    ownTasksLocal.forEach(t => map.set(t.id, t));
    sharedMap.forEach(t => map.set(t.id, t));
    tasks.value = Array.from(map.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  function clearShared() {
    sharedUnsubs.forEach(unsub => unsub());
    sharedUnsubs.clear();
    sharedMap.clear();
  }

  watch(() => user.value?.uid, (uid) => {
    unsubOwn?.();
    unsubMembers?.();
    clearShared();

    if (!uid) {
      tasks.value = [];
      ownTasksLocal = [];
      return;
    }

    // PROPIAS (real-time)
    const ownQuery = query(collection(db, "tasks"), where("userId", "==", uid));
    unsubOwn = onSnapshot(ownQuery, (snap) => {
      ownTasksLocal = snap.docs.map(d => ({ ...(d.data() as Task), id: d.id }));
      syncFinalTasks();
    }, (err) => {
      console.error("Error en tareas propias:", err);
    });

    // MEMBERS (real-time)
    const membersQuery = query(collectionGroup(db, "members"), where("uid", "==", uid));
    unsubMembers = onSnapshot(membersQuery, (snap) => {
      const taskIds = snap.docs.map(d => d.ref.parent.parent?.id).filter(Boolean) as string[];
      const nextSet = new Set(taskIds);

      // quitar listeners de tasks que ya no están compartidas
      Array.from(sharedUnsubs.keys()).forEach((taskId) => {
        if (!nextSet.has(taskId)) {
          const unsub = sharedUnsubs.get(taskId);
          if (unsub) unsub();
          sharedUnsubs.delete(taskId);
          sharedMap.delete(taskId);
        }
      });

      // añadir listeners nuevos
      taskIds.forEach((taskId) => {
        if (sharedUnsubs.has(taskId)) return;

        const taskRef = doc(db, "tasks", taskId);
        const unsubTask = onSnapshot(taskRef, (taskSnap) => {
          if (!taskSnap.exists()) {
            sharedMap.delete(taskId);
            syncFinalTasks();
            return;
          }
          sharedMap.set(taskId, { ...(taskSnap.data() as Task), id: taskSnap.id });
          syncFinalTasks();
        }, (err) => {
          console.error("Error en listener de task compartida:", taskId, err);
        });

        sharedUnsubs.set(taskId, unsubTask);
      });

      syncFinalTasks();
    }, (err) => {
      console.error("Error en listener members (collectionGroup):", err);
    });
  }, { immediate: true });

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
    await updateDoc(doc(db, "tasks", taskId), { ...cleaned, updatedAt: now });
  }

  async function deleteTask(taskId: string) {
    await deleteDoc(doc(db, "tasks", taskId));
  }

  async function addSubtask(task: Task, input: SubtaskInput) {
    const newSub = {
      id: crypto.randomUUID(),
      title: input.title,
      done: !!input.done,
      description: input.description?.trim() || undefined,
      link: input.link?.trim() || undefined,
      dueDate: input.dueDate?.trim() || undefined,
    };
    const subtasks = [...(task.subtasks || []), newSub];
    await updateTask(task.id, { subtasks, completed: subtasks.length > 0 && subtasks.every(s => s.done) });
  }

  async function updateSubtask(task: Task, subId: string, payload: Partial<Subtask>) {
    const subtasks = task.subtasks.map(s => s.id === subId ? { ...s, ...cleanUndefined(payload) } : s);
    await updateTask(task.id, { subtasks, completed: subtasks.every(s => s.done) });
  }

  async function deleteSubtask(task: Task, subId: string) {
    const subtasks = task.subtasks.filter(s => s.id !== subId);
    await updateTask(task.id, { subtasks, completed: subtasks.length > 0 && subtasks.every(s => s.done) });
  }

  async function toggleSubtask(task: Task, subId: string) {
    const subtasks = task.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s);
    await updateTask(task.id, { subtasks, completed: subtasks.every(s => s.done) });
  }

  async function uncheckAllSubtasks(task: Task) {
    const subtasks = task.subtasks.map(s => ({ ...s, done: false }));
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
