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

// Estado global reactivo
const tasks = ref<Task[]>([]);

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

  // Almacenes temporales para unir ambos flujos sin perder datos
  let ownTasksLocal: Task[] = [];
  let sharedTasksLocal: Task[] = [];

  function syncFinalTasks() {
    const map = new Map();
    // Prioridad a las propias, luego añade/sobreescribe con compartidas
    ownTasksLocal.forEach(t => map.set(t.id, t));
    sharedTasksLocal.forEach(t => map.set(t.id, t));
    
    tasks.value = Array.from(map.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  watch(
    () => user.value?.uid,
    (uid) => {
      unsubOwn?.();
      unsubShared?.();
      
      if (!uid) {
        tasks.value = [];
        ownTasksLocal = [];
        sharedTasksLocal = [];
        return;
      }

      // --- ESCUCHAR TAREAS PROPIAS ---
      const ownQuery = query(collection(db, "tasks"), where("userId", "==", uid));
      unsubOwn = onSnapshot(ownQuery, (snap) => {
        ownTasksLocal = snap.docs.map(d => ({ ...(d.data() as Task), id: d.id }));
        syncFinalTasks();
      }, (err) => {
        console.error("Error en tareas propias:", err);
      });

      // --- ESCUCHAR TAREAS COMPARTIDAS ---
      const sharedQuery = query(collectionGroup(db, "members"), where("uid", "==", uid));
      
      unsubShared = onSnapshot(sharedQuery, async (snap) => {
        const taskIds = snap.docs
          .map(d => d.ref.parent.parent?.id)
          .filter(Boolean) as string[];

        if (taskIds.length === 0) {
          sharedTasksLocal = [];
          syncFinalTasks();
          return;
        }

        try {

          const promises = taskIds.map(id => getDoc(doc(db, "tasks", id)));
          const snapshots = await Promise.all(promises);

          sharedTasksLocal = snapshots
            .filter(s => s.exists())
            .map(s => ({ ...(s.data() as Task), id: s.id }));
            
          syncFinalTasks();
        } catch (e) {
          console.error("Error cargando detalles compartidos:", e);
        }
      }, (err) => {
        console.error("Error en el listener de compartidas (Collection Group):", err);
      });
    },
    { immediate: true }
  );

  // --- COMPUTED PROPERTIES ---
  const tasksOnly = computed(() => tasks.value.filter((t) => t.type === "task"));
  const notes = computed(() => tasks.value.filter((t) => t.type === "note"));
  const activeTasks = computed(() => tasksOnly.value.filter((t) => !t.completed));
  const completedTasks = computed(() => tasksOnly.value.filter((t) => t.completed));

  // --- MÉTODOS DE ACCIÓN ---
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
    const cleaned = cleanUndefined(payload);
    await updateDoc(doc(db, "tasks", taskId), {
      ...cleaned,
      updatedAt: Timestamp.now(),
    });
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
