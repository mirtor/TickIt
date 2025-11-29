import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useTasks } from "@/composables/useTasks";
import NewTaskModal from "../components/NewTaskModal.vue";
import TaskDetailModal from "../components/TaskDetailModal.vue";
import NewSubtaskModal from "../components/NewSubtaskModal.vue";
import DeleteTaskModal from "../components/DeleteTaskModal.vue";
import EditTaskModal from "../components/EditTaskModal.vue";
const router = useRouter();
const { user, logout } = useAuth();
const { tasks, tasksOnly, notes, activeTasks, completedTasks, createTask, deleteTask, addSubtask, updateTask, updateSubtask, deleteSubtask, toggleSubtask, uncheckAllSubtasks, } = useTasks();
// Estado de modales
const showNewTaskModal = ref(false);
const selectedTask = ref(null); // modal lista subtareas
const editingSubtaskId = ref(null);
const subtaskModalTask = ref(null); // modal nueva subtarea
const showDeleteModal = ref(false);
const taskToDelete = ref(null);
const activeTab = ref("tasks");
const itemBeingEdited = ref(null);
// Redirección si no hay usuario
watch(() => user.value, (u) => {
    if (!u) {
        router.push({ name: "login" });
    }
}, { immediate: true });
// Mantener referencias sincronizadas si cambian las tareas
watch(tasks, (newTasks) => {
    if (selectedTask.value) {
        const u = newTasks.find((t) => t.id === selectedTask.value?.id);
        if (u)
            selectedTask.value = u;
    }
    if (subtaskModalTask.value) {
        const u = newTasks.find((t) => t.id === subtaskModalTask.value?.id);
        if (u)
            subtaskModalTask.value = u;
    }
    if (taskToDelete.value) {
        const u = newTasks.find((t) => t.id === taskToDelete.value?.id);
        if (u)
            taskToDelete.value = u;
    }
}, { deep: true });
// Crear tarea
async function handleCreateTask(payload) {
    await createTask(payload);
    showNewTaskModal.value = false;
}
// Click en tarjeta: solo abre detalle si tiene subtareas
function onTaskCardClick(task) {
    selectedTask.value = task;
}
// Nueva subtarea (abrir modal)
function openSubtaskModal(task) {
    subtaskModalTask.value = task;
    editingSubtaskId.value = null;
}
// Acciones sobre subtareas (modal lista)
async function handleToggleSubtask(subtaskId) {
    if (!selectedTask.value)
        return;
    await toggleSubtask(selectedTask.value, subtaskId);
}
async function handleUncheckAll() {
    if (!selectedTask.value)
        return;
    await uncheckAllSubtasks(selectedTask.value);
}
function handleEditSubtask(subtaskId) {
    if (!selectedTask.value)
        return;
    subtaskModalTask.value = selectedTask.value;
    editingSubtaskId.value = subtaskId; // modo edición
}
// Borrar tarea
function openDeleteModal(task) {
    taskToDelete.value = task;
    showDeleteModal.value = true;
}
function closeDeleteModal() {
    showDeleteModal.value = false;
    taskToDelete.value = null;
}
async function confirmDeleteTask() {
    if (!taskToDelete.value)
        return;
    await deleteTask(taskToDelete.value.id);
    if (selectedTask.value?.id === taskToDelete.value.id) {
        selectedTask.value = null;
    }
    showDeleteModal.value = false;
    taskToDelete.value = null;
}
// Logout
async function onLogout() {
    await logout();
    router.push({ name: "login" });
}
function openEditTaskModal(task) {
    itemBeingEdited.value = task;
}
function closeEditTaskModal() {
    itemBeingEdited.value = null;
}
async function handleSaveEditedTask(payload) {
    if (!itemBeingEdited.value)
        return;
    const t = itemBeingEdited.value;
    await updateTask(t.id, {
        title: payload.title,
        // solo para notas
        description: t.type === "note" ? payload.description ?? "" : undefined,
    });
    itemBeingEdited.value = null;
}
function closeSubtaskModal() {
    subtaskModalTask.value = null;
    editingSubtaskId.value = null;
}
// Submit nueva subtarea o edición
async function handleSubmitSubtask(payload) {
    if (!subtaskModalTask.value)
        return;
    // Crear
    if (!editingSubtaskId.value) {
        await addSubtask(subtaskModalTask.value, {
            title: payload.title,
            description: payload.description,
            link: payload.link,
            dueDate: payload.dueDate,
            done: false,
        });
    }
    else {
        // Editar
        await updateSubtask(subtaskModalTask.value, editingSubtaskId.value, {
            title: payload.title,
            description: payload.description,
            link: payload.link,
            dueDate: payload.dueDate,
        });
    }
    closeSubtaskModal();
}
async function handleDeleteSubtaskFromModal() {
    if (!subtaskModalTask.value || !editingSubtaskId.value)
        return;
    await deleteSubtask(subtaskModalTask.value, editingSubtaskId.value);
    closeSubtaskModal();
}
function getListForItem(item) {
    if (item.type === "note") {
        return notes.value;
    }
    // Para tareas: usamos lista de activas o completadas
    return item.completed ? completedTasks.value : activeTasks.value;
}
async function moveItemUp(item) {
    const list = getListForItem(item);
    const index = list.findIndex((t) => t.id === item.id);
    if (index <= 0)
        return;
    const prev = list[index - 1];
    await Promise.all([
        updateTask(item.id, { order: prev.order }),
        updateTask(prev.id, { order: item.order }),
    ]);
}
async function moveItemDown(item) {
    const list = getListForItem(item);
    const index = list.findIndex((t) => t.id === item.id);
    if (index === -1 || index >= list.length - 1)
        return;
    const next = list[index + 1];
    await Promise.all([
        updateTask(item.id, { order: next.order }),
        updateTask(next.id, { order: item.order }),
    ]);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "task-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "task-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "task-header-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.img)({
    src: "/TickitIcon.svg",
    alt: "Tickit",
    ...{ class: "task-header-logo" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "task-header-user" },
});
if (__VLS_ctx.user?.email) {
    // @ts-ignore
    [user,];
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.user.email);
    // @ts-ignore
    [user,];
}
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.onLogout) },
    ...{ class: "btn btn-outline" },
    ...{ style: {} },
});
// @ts-ignore
[onLogout,];
__VLS_asFunctionalElement(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "task-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showNewTaskModal = true;
            // @ts-ignore
            [showNewTaskModal,];
        } },
    ...{ class: "btn btn-primary btn-fixed" },
    title: "Añadir tarea",
});
__VLS_asFunctionalElement(__VLS_intrinsics.img)({
    src: "/addIcon.svg",
    alt: "Editar",
    ...{ class: "task-card-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "auth-tabs" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'tasks';
            // @ts-ignore
            [activeTab,];
        } },
    ...{ class: "auth-tab task-button" },
    ...{ class: ({ 'auth-tab--active': __VLS_ctx.activeTab === 'tasks' }) },
});
// @ts-ignore
[activeTab,];
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'notes';
            // @ts-ignore
            [activeTab,];
        } },
    ...{ class: "auth-tab note-button" },
    ...{ class: ({ 'auth-tab--active': __VLS_ctx.activeTab === 'notes' }) },
});
// @ts-ignore
[activeTab,];
if (__VLS_ctx.activeTab === 'tasks') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
    if (__VLS_ctx.activeTasks.length) {
        // @ts-ignore
        [activeTasks,];
        __VLS_asFunctionalElement(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "task-list-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "task-list-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "task-list" },
        });
        for (const [task] of __VLS_getVForSourceType((__VLS_ctx.activeTasks))) {
            // @ts-ignore
            [activeTasks,];
            __VLS_asFunctionalElement(__VLS_intrinsics.article, __VLS_intrinsics.article)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'tasks'))
                            return;
                        if (!(__VLS_ctx.activeTasks.length))
                            return;
                        __VLS_ctx.onTaskCardClick(task);
                        // @ts-ignore
                        [onTaskCardClick,];
                    } },
                key: (task.id),
                ...{ class: "task-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: () => { } },
                ...{ class: "task-card-icons" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'tasks'))
                            return;
                        if (!(__VLS_ctx.activeTasks.length))
                            return;
                        __VLS_ctx.moveItemUp(task);
                        // @ts-ignore
                        [moveItemUp,];
                    } },
                ...{ class: "icon-btn" },
                title: "Mover arriba",
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'tasks'))
                            return;
                        if (!(__VLS_ctx.activeTasks.length))
                            return;
                        __VLS_ctx.moveItemDown(task);
                        // @ts-ignore
                        [moveItemDown,];
                    } },
                ...{ class: "icon-btn" },
                title: "Mover abajo",
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "task-card-main" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "task-card-title" },
            });
            (task.title);
            if (task.subtasks && task.subtasks.length) {
                __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "task-card-subtitle" },
                });
                (task.subtasks.filter((s) => !s.done).length);
            }
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: () => { } },
                ...{ class: "task-card-icons" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'tasks'))
                            return;
                        if (!(__VLS_ctx.activeTasks.length))
                            return;
                        __VLS_ctx.openDeleteModal(task);
                        // @ts-ignore
                        [openDeleteModal,];
                    } },
                ...{ class: "icon-btn icon-btn-danger" },
                title: "Borrar tarea",
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.img)({
                src: "/deleteIcon.svg",
                alt: "Borrar tarea",
                ...{ class: "task-card-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'tasks'))
                            return;
                        if (!(__VLS_ctx.activeTasks.length))
                            return;
                        __VLS_ctx.openEditTaskModal(task);
                        // @ts-ignore
                        [openEditTaskModal,];
                    } },
                ...{ class: "icon-btn" },
                title: "Editar tarea",
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.img)({
                src: "/editIcon.svg",
                alt: "Editar",
                ...{ class: "task-card-icon" },
            });
        }
    }
    if (__VLS_ctx.completedTasks.length) {
        // @ts-ignore
        [completedTasks,];
        __VLS_asFunctionalElement(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "task-list-section" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "task-list-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "task-list" },
        });
        for (const [task] of __VLS_getVForSourceType((__VLS_ctx.completedTasks))) {
            // @ts-ignore
            [completedTasks,];
            __VLS_asFunctionalElement(__VLS_intrinsics.article, __VLS_intrinsics.article)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'tasks'))
                            return;
                        if (!(__VLS_ctx.completedTasks.length))
                            return;
                        __VLS_ctx.onTaskCardClick(task);
                        // @ts-ignore
                        [onTaskCardClick,];
                    } },
                key: (task.id),
                ...{ class: "task-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: () => { } },
                ...{ class: "task-card-icons" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'tasks'))
                            return;
                        if (!(__VLS_ctx.completedTasks.length))
                            return;
                        __VLS_ctx.moveItemUp(task);
                        // @ts-ignore
                        [moveItemUp,];
                    } },
                ...{ class: "icon-btn" },
                title: "Mover arriba",
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'tasks'))
                            return;
                        if (!(__VLS_ctx.completedTasks.length))
                            return;
                        __VLS_ctx.moveItemDown(task);
                        // @ts-ignore
                        [moveItemDown,];
                    } },
                ...{ class: "icon-btn" },
                title: "Mover abajo",
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "task-card-main" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "task-card-title" },
                ...{ style: {} },
            });
            (task.title);
            __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "task-card-subtitle" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: () => { } },
                ...{ class: "task-card-icons" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'tasks'))
                            return;
                        if (!(__VLS_ctx.completedTasks.length))
                            return;
                        __VLS_ctx.openEditTaskModal(task);
                        // @ts-ignore
                        [openEditTaskModal,];
                    } },
                ...{ class: "icon-btn" },
                title: "Editar tarea",
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.img)({
                src: "/editIcon.svg",
                alt: "Editar",
                ...{ class: "task-card-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'tasks'))
                            return;
                        if (!(__VLS_ctx.completedTasks.length))
                            return;
                        __VLS_ctx.openDeleteModal(task);
                        // @ts-ignore
                        [openDeleteModal,];
                    } },
                ...{ class: "icon-btn icon-btn-danger" },
                title: "Borrar tarea",
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.img)({
                src: "/deleteIcon.svg",
                alt: "Borrar tarea",
                ...{ class: "task-card-icon" },
            });
        }
    }
}
if (__VLS_ctx.activeTab === 'notes') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "task-list-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "task-list-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "task-list" },
    });
    for (const [note] of __VLS_getVForSourceType((__VLS_ctx.notes))) {
        // @ts-ignore
        [notes,];
        __VLS_asFunctionalElement(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'notes'))
                        return;
                    __VLS_ctx.openEditTaskModal(note);
                    // @ts-ignore
                    [openEditTaskModal,];
                } },
            key: (note.id),
            ...{ class: "task-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ...{ class: "task-card-icons" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'notes'))
                        return;
                    __VLS_ctx.moveItemUp(note);
                    // @ts-ignore
                    [moveItemUp,];
                } },
            ...{ class: "icon-btn" },
            title: "Mover arriba",
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'notes'))
                        return;
                    __VLS_ctx.moveItemDown(note);
                    // @ts-ignore
                    [moveItemDown,];
                } },
            ...{ class: "icon-btn" },
            title: "Mover abajo",
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "task-card-main" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "task-card-title" },
        });
        (note.title);
        if (note.description) {
            __VLS_asFunctionalElement(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ style: {} },
            });
            for (const [line, idx] of __VLS_getVForSourceType((note.description
                .split('\n')
                .filter((l) => l.trim().length)))) {
                __VLS_asFunctionalElement(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (idx),
                });
                (line);
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ...{ class: "task-card-icons" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'notes'))
                        return;
                    __VLS_ctx.openEditTaskModal(note);
                    // @ts-ignore
                    [openEditTaskModal,];
                } },
            ...{ class: "icon-btn" },
            title: "Editar nota",
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.img)({
            src: "/editIcon.svg",
            alt: "Editar",
            ...{ class: "task-card-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'notes'))
                        return;
                    __VLS_ctx.openDeleteModal(note);
                    // @ts-ignore
                    [openDeleteModal,];
                } },
            ...{ class: "icon-btn icon-btn-danger" },
            title: "Borrar nota",
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.img)({
            src: "/deleteIcon.svg",
            alt: "Borrar nota",
            ...{ class: "task-card-icon" },
        });
    }
}
if (!__VLS_ctx.activeTasks.length && !__VLS_ctx.completedTasks.length) {
    // @ts-ignore
    [activeTasks, completedTasks,];
    __VLS_asFunctionalElement(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
}
if (__VLS_ctx.showNewTaskModal) {
    // @ts-ignore
    [showNewTaskModal,];
    /** @type {[typeof NewTaskModal, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(NewTaskModal, new NewTaskModal({
        ...{ 'onClose': {} },
        ...{ 'onCreate': {} },
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onClose': {} },
        ...{ 'onCreate': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    const __VLS_5 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.showNewTaskModal))
                    return;
                __VLS_ctx.showNewTaskModal = false;
                // @ts-ignore
                [showNewTaskModal,];
            } });
    const __VLS_6 = ({ create: {} },
        { onCreate: (__VLS_ctx.handleCreateTask) });
    // @ts-ignore
    [handleCreateTask,];
    var __VLS_2;
}
if (__VLS_ctx.selectedTask) {
    // @ts-ignore
    [selectedTask,];
    /** @type {[typeof TaskDetailModal, ]} */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(TaskDetailModal, new TaskDetailModal({
        ...{ 'onClose': {} },
        ...{ 'onToggleSubtask': {} },
        ...{ 'onUncheckAll': {} },
        ...{ 'onOpenNewSubtask': {} },
        ...{ 'onEditSubtask': {} },
        task: (__VLS_ctx.selectedTask),
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onClose': {} },
        ...{ 'onToggleSubtask': {} },
        ...{ 'onUncheckAll': {} },
        ...{ 'onOpenNewSubtask': {} },
        ...{ 'onEditSubtask': {} },
        task: (__VLS_ctx.selectedTask),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_11;
    let __VLS_12;
    const __VLS_13 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.selectedTask))
                    return;
                __VLS_ctx.selectedTask = null;
                // @ts-ignore
                [selectedTask, selectedTask,];
            } });
    const __VLS_14 = ({ toggleSubtask: {} },
        { onToggleSubtask: (__VLS_ctx.handleToggleSubtask) });
    const __VLS_15 = ({ uncheckAll: {} },
        { onUncheckAll: (__VLS_ctx.handleUncheckAll) });
    const __VLS_16 = ({ openNewSubtask: {} },
        { onOpenNewSubtask: (() => { if (__VLS_ctx.selectedTask)
                __VLS_ctx.openSubtaskModal(__VLS_ctx.selectedTask); }) });
    const __VLS_17 = ({ editSubtask: {} },
        { onEditSubtask: (__VLS_ctx.handleEditSubtask) });
    // @ts-ignore
    [selectedTask, selectedTask, handleToggleSubtask, handleUncheckAll, openSubtaskModal, handleEditSubtask,];
    var __VLS_10;
}
if (__VLS_ctx.subtaskModalTask) {
    // @ts-ignore
    [subtaskModalTask,];
    /** @type {[typeof NewSubtaskModal, ]} */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(NewSubtaskModal, new NewSubtaskModal({
        ...{ 'onClose': {} },
        ...{ 'onSubmit': {} },
        ...{ 'onDelete': {} },
        taskTitle: (__VLS_ctx.subtaskModalTask.title),
        mode: (__VLS_ctx.editingSubtaskId ? 'edit' : 'create'),
        initialSubtask: (__VLS_ctx.editingSubtaskId && __VLS_ctx.subtaskModalTask
            ? __VLS_ctx.subtaskModalTask.subtasks.find(st => st.id === __VLS_ctx.editingSubtaskId) || undefined
            : undefined),
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onClose': {} },
        ...{ 'onSubmit': {} },
        ...{ 'onDelete': {} },
        taskTitle: (__VLS_ctx.subtaskModalTask.title),
        mode: (__VLS_ctx.editingSubtaskId ? 'edit' : 'create'),
        initialSubtask: (__VLS_ctx.editingSubtaskId && __VLS_ctx.subtaskModalTask
            ? __VLS_ctx.subtaskModalTask.subtasks.find(st => st.id === __VLS_ctx.editingSubtaskId) || undefined
            : undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_22;
    let __VLS_23;
    const __VLS_24 = ({ close: {} },
        { onClose: (__VLS_ctx.closeSubtaskModal) });
    const __VLS_25 = ({ submit: {} },
        { onSubmit: (__VLS_ctx.handleSubmitSubtask) });
    const __VLS_26 = ({ delete: {} },
        { onDelete: (__VLS_ctx.handleDeleteSubtaskFromModal) });
    // @ts-ignore
    [subtaskModalTask, subtaskModalTask, subtaskModalTask, editingSubtaskId, editingSubtaskId, editingSubtaskId, closeSubtaskModal, handleSubmitSubtask, handleDeleteSubtaskFromModal,];
    var __VLS_21;
}
if (__VLS_ctx.showDeleteModal && __VLS_ctx.taskToDelete) {
    // @ts-ignore
    [showDeleteModal, taskToDelete,];
    /** @type {[typeof DeleteTaskModal, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(DeleteTaskModal, new DeleteTaskModal({
        ...{ 'onCancel': {} },
        ...{ 'onConfirm': {} },
        taskTitle: (__VLS_ctx.taskToDelete.title),
    }));
    const __VLS_29 = __VLS_28({
        ...{ 'onCancel': {} },
        ...{ 'onConfirm': {} },
        taskTitle: (__VLS_ctx.taskToDelete.title),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_31;
    let __VLS_32;
    const __VLS_33 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.closeDeleteModal) });
    const __VLS_34 = ({ confirm: {} },
        { onConfirm: (__VLS_ctx.confirmDeleteTask) });
    // @ts-ignore
    [taskToDelete, closeDeleteModal, confirmDeleteTask,];
    var __VLS_30;
}
if (__VLS_ctx.itemBeingEdited) {
    // @ts-ignore
    [itemBeingEdited,];
    /** @type {[typeof EditTaskModal, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(EditTaskModal, new EditTaskModal({
        ...{ 'onCancel': {} },
        ...{ 'onSave': {} },
        task: (__VLS_ctx.itemBeingEdited),
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onCancel': {} },
        ...{ 'onSave': {} },
        task: (__VLS_ctx.itemBeingEdited),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_39;
    let __VLS_40;
    const __VLS_41 = ({ cancel: {} },
        { onCancel: (__VLS_ctx.closeEditTaskModal) });
    const __VLS_42 = ({ save: {} },
        { onSave: (__VLS_ctx.handleSaveEditedTask) });
    // @ts-ignore
    [itemBeingEdited, closeEditTaskModal, handleSaveEditedTask,];
    var __VLS_38;
}
/** @type {__VLS_StyleScopedClasses['task-page']} */ ;
/** @type {__VLS_StyleScopedClasses['task-header']} */ ;
/** @type {__VLS_StyleScopedClasses['task-header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['task-header-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['task-header-user']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
/** @type {__VLS_StyleScopedClasses['task-main']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['task-button']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab--active']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['note-button']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab--active']} */ ;
/** @type {__VLS_StyleScopedClasses['task-list-section']} */ ;
/** @type {__VLS_StyleScopedClasses['task-list-title']} */ ;
/** @type {__VLS_StyleScopedClasses['task-list']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-main']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['task-list-section']} */ ;
/** @type {__VLS_StyleScopedClasses['task-list-title']} */ ;
/** @type {__VLS_StyleScopedClasses['task-list']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-main']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['task-list-section']} */ ;
/** @type {__VLS_StyleScopedClasses['task-list-title']} */ ;
/** @type {__VLS_StyleScopedClasses['task-list']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-main']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icon']} */ ;
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
