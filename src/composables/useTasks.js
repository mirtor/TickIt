import { computed, ref, watch } from "vue";
import { db } from "@/services/firebase";
import { addDoc, collection, doc, onSnapshot, query, Timestamp, updateDoc, where, deleteDoc, } from "firebase/firestore";
import { useAuth } from "./useAuth";
const tasks = ref([]);
let unsubscribe = null;
export function useTasks() {
    const { user } = useAuth();
    watch(() => user.value?.uid, (uid) => {
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
            const raw = snapshot.docs.map((d) => {
                const data = d.data();
                const type = data.type ?? "task"; // compat con docs viejos
                const subtasks = Array.isArray(data.subtasks) ? data.subtasks : [];
                return {
                    id: d.id,
                    ...data,
                    type,
                    subtasks,
                };
            });
            // ordenamos por "order"
            tasks.value = raw.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        });
    }, { immediate: true });
    // Separaciones
    const tasksOnly = computed(() => tasks.value.filter((t) => (t.type ?? "task") === "task"));
    const notes = computed(() => tasks.value.filter((t) => (t.type ?? "task") === "note"));
    const activeTasks = computed(() => tasksOnly.value.filter((t) => !t.completed));
    const completedTasks = computed(() => tasksOnly.value.filter((t) => t.completed));
    async function createTask(payload) {
        if (!user.value)
            return;
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

    function cleanUndefined(obj) {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj || {})) {
            if (value !== undefined) cleaned[key] = value;
        }
        return cleaned;
    }

    async function updateTask(taskId, payload) {
        const now = Timestamp.now();

        const cleaned = cleanUndefined(payload);

        await updateDoc(doc(db, "tasks", taskId), {
            ...cleaned,
            updatedAt: now,
        });
    }

    async function deleteTask(taskId) {
        await deleteDoc(doc(db, "tasks", taskId));
    }

    async function addSubtask(task, subtaskInput) {
        const newSubtask = {
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
            subtasks: updatedSubtasks,
            completed: updatedSubtasks.length > 0 &&
                updatedSubtasks.every((st) => st.done),
        });
    }

    async function updateSubtask(task, subtaskId, payload) {
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

    async function deleteSubtask(task, subtaskId) {
        const updatedSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);
        const completed = updatedSubtasks.length > 0 &&
            updatedSubtasks.every((st) => st.done);
        await updateTask(task.id, {
            subtasks: updatedSubtasks,
            completed,
        });
    }

    async function toggleSubtask(task, subtaskId) {
        const updatedSubtasks = task.subtasks.map((st) => st.id === subtaskId ? { ...st, done: !st.done } : st);
        const completed = updatedSubtasks.length > 0 &&
            updatedSubtasks.every((st) => st.done);
        await updateTask(task.id, {
            subtasks: updatedSubtasks,
            completed,
        });
    }

    async function uncheckAllSubtasks(task) {
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
