<template>
  <div class="task-page">
    <!-- Header -->
    <header class="task-header">
      <div class="task-header-left">
        <img src="/TickitIcon.svg" alt="Tickit" class="task-header-logo" />
      </div>
      <div class="task-header-user">
        <span v-if="user?.email">{{ user.email }}</span>
        <button
          class="btn btn-outline"
          style="font-size: 0.7rem; padding: 0.4rem 0.7rem"
          @click="onLogout"
        >
          Cerrar sesión
        </button>
      </div>
    </header>

 

    <!-- Contenido principal -->
    <main class="task-main">
      <button
        class="btn btn-primary btn-fixed"
        @click="showNewTaskModal = true"
        title="Añadir tarea"
      >
        <img src="/addIcon.svg" alt="Editar" class="task-card-icon" />
      </button>

      <div class="auth-tabs" style="justify-content: flex-start; margin-bottom: 0.75rem;">
        <button
          class="auth-tab task-button"
          :class="{ 'auth-tab--active': activeTab === 'tasks' }"
          @click="activeTab = 'tasks'"
        >
          Tareas
        </button>

        <button
          class="auth-tab note-button"
          :class="{ 'auth-tab--active': activeTab === 'notes' }"
          @click="activeTab = 'notes'"
        >
          Notas
        </button>
      </div>


      <!-- Tareas -->
      <section v-if="activeTab === 'tasks'">
        <!-- Tareas activas -->
        <section v-if="activeTasks.length" class="task-list-section">
          <h2 class="task-list-title">Tareas activas</h2>
          <div class="task-list">
            <article
              v-for="task in activeTasks"
              :key="task.id"
              class="task-card"
              @click="onTaskCardClick(task)"
            >

              <div class="task-card-icons" @click.stop>
                 <!-- Reordenar -->
                <button
                  class="icon-btn"
                  @click="moveItemUp(task)"
                  title="Mover arriba"
                >
                  ↑
                </button>
                <button
                  class="icon-btn"
                  @click="moveItemDown(task)"
                  title="Mover abajo"
                >
                  ↓
                </button>

              </div>

              <div class="task-card-main">
                <h3 class="task-card-title">
                  {{ task.title }}
                </h3>

                <p
                  v-if="task.subtasks && task.subtasks.length"
                  class="task-card-subtitle"
                >
                  {{ task.subtasks.filter((s) => !s.done).length }} subtareas pendientes
                </p>
              </div>

              <div class="task-card-icons" @click.stop>
                <!-- Borrar tarea -->
                <button
                  class="icon-btn icon-btn-danger"
                  @click="openDeleteModal(task)"
                  title="Borrar tarea"
                >
                  <img
                    src="/deleteIcon.svg"
                    alt="Borrar tarea"
                    class="task-card-icon"
                  />
                </button>

                <!-- Añadir subtarea 
                <button
                  class="icon-btn"
                  @click="openSubtaskModal(task)"
                  title="Añadir subtarea"
                >
                  <img
                    src="/subtaskIcon.svg"
                    alt="Añadir subtarea"
                    class="task-card-icon"
                  />
                </button>
                -->

                <!-- Editar tarea -->
                <button
                  class="icon-btn"
                  @click="openEditTaskModal(task)"
                  title="Editar tarea"
                >
                  <img src="/editIcon.svg" alt="Editar" class="task-card-icon" />
                </button>

              </div>
            </article>
          </div>
        </section>

        <!-- Tareas completadas -->
        <section v-if="completedTasks.length" class="task-list-section" style="margin-top: 1.25rem">
          <h2 class="task-list-title">Tareas completadas</h2>
          <div class="task-list">
            <article
              v-for="task in completedTasks"
              :key="task.id"
              class="task-card"
              @click="onTaskCardClick(task)"
            >
              <div class="task-card-icons" @click.stop>
                <!-- Reordenar -->
                <button
                  class="icon-btn"
                  @click="moveItemUp(task)"
                  title="Mover arriba"
                >
                  ↑
                </button>
                <button
                  class="icon-btn"
                  @click="moveItemDown(task)"
                  title="Mover abajo"
                >
                  ↓
                </button>

              </div>

              <div class="task-card-main">
                <h3 class="task-card-title" style="text-decoration: line-through; color: #6b7280">
                  {{ task.title }}
                </h3>
                <p class="task-card-subtitle">
                  Todas las subtareas completadas
                </p>
              </div>

              <div class="task-card-icons" @click.stop>
                <!-- Editar tarea -->
                <button
                  class="icon-btn"
                  @click="openEditTaskModal(task)"
                  title="Editar tarea"
                >
                  <img src="/editIcon.svg" alt="Editar" class="task-card-icon" />
                </button>

                <!-- Borrar tarea -->
                <button
                  class="icon-btn icon-btn-danger"
                  @click="openDeleteModal(task)"
                  title="Borrar tarea"
                >
                  <img
                    src="/deleteIcon.svg"
                    alt="Borrar tarea"
                    class="task-card-icon"
                  />
                </button>
              </div>
            </article>
          </div>
        </section>

      </section>

      <!-- Notas -->
      <section v-if="activeTab === 'notes'" class="task-list-section">
        <h2 class="task-list-title">Notas</h2>

        <div class="task-list">
          <article
            v-for="note in notes"
            :key="note.id"
            class="task-card"
            @click="openEditTaskModal(note)"
          >
              <div class="task-card-icons" @click.stop>
                <!-- Reordenar -->
                <button
                  class="icon-btn"
                  @click="moveItemUp(note)"
                  title="Mover arriba"
                >
                  ↑
                </button>
                <button
                  class="icon-btn"
                  @click="moveItemDown(note)"
                  title="Mover abajo"
                >
                  ↓
                </button>

              </div>

            <div class="task-card-main">
              
              <h3 class="task-card-title">
                {{ note.title }}
              </h3>

              <!-- Descripción como lista de puntos por salto de línea -->
              <ul
                v-if="note.description"
                style="margin: 0.3rem 0 0; padding-left: 1rem; font-size: 0.8rem; color: var(--text-muted);"
              >
                <li
                  v-for="(line, idx) in note.description
                    .split('\n')
                    .filter((l) => l.trim().length)"
                  :key="idx"
                >
                  {{ line }}
                </li>
              </ul>
            </div>

            <div class="task-card-icons" @click.stop>
              <!-- Editar nota -->
              <button
                class="icon-btn"
                @click="openEditTaskModal(note)"
                title="Editar nota"
              >
                <img src="/editIcon.svg" alt="Editar" class="task-card-icon" />
              </button>

              <!-- Borrar nota -->
              <button
                class="icon-btn icon-btn-danger"
                @click="openDeleteModal(note)"
                title="Borrar nota"
              >
                <img
                  src="/deleteIcon.svg"
                  alt="Borrar nota"
                  class="task-card-icon"
                />
              </button>
            </div>

          </article>
        </div>

      </section>

      
      <!-- Si no hay tareas -->
      <section v-if="!activeTasks.length && !completedTasks.length" style="margin-top: 2rem; text-align: center">
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Todavía no tienes tareas. Pulsa <strong>“Nueva tarea”</strong> para crear la primera.
        </p>
      </section>
    </main>

    <!-- Modal: nueva tarea -->
    <NewTaskModal
      v-if="showNewTaskModal"
      @close="showNewTaskModal = false"
      @create="handleCreateTask"
    />

    <!-- Modal: detalle de tarea (solo lista) -->
    <TaskDetailModal
      v-if="selectedTask"
      :task="selectedTask"
      @close="selectedTask = null"
      @toggle-subtask="handleToggleSubtask"
      @uncheck-all="handleUncheckAll"
      @open-new-subtask="() => { if (selectedTask) openSubtaskModal(selectedTask) }"
      @edit-subtask="handleEditSubtask"
    />

    <!-- Modal: nueva subtarea -->
    <NewSubtaskModal
      v-if="subtaskModalTask"
      :taskTitle="subtaskModalTask.title"
      :mode="editingSubtaskId ? 'edit' : 'create'"
      :initialSubtask="editingSubtaskId && subtaskModalTask
        ? subtaskModalTask.subtasks.find(st => st.id === editingSubtaskId) || undefined
        : undefined"
      @close="closeSubtaskModal"
      @submit="handleSubmitSubtask"
      @delete="handleDeleteSubtaskFromModal"
    />

    <!-- Modal: confirmación de borrado -->
    <DeleteTaskModal
      v-if="showDeleteModal && taskToDelete"
      :taskTitle="taskToDelete.title"
      @cancel="closeDeleteModal"
      @confirm="confirmDeleteTask"
    />

    <!-- Modal: editar tareas -->
    <EditTaskModal
      v-if="itemBeingEdited"
      :task="itemBeingEdited"
      @cancel="closeEditTaskModal"
      @save="handleSaveEditedTask"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useTasks, Task, TaskType  } from "@/composables/useTasks";

import NewTaskModal from "../components/NewTaskModal.vue";
import TaskDetailModal from "../components/TaskDetailModal.vue";
import NewSubtaskModal from "../components/NewSubtaskModal.vue";
import DeleteTaskModal from "../components/DeleteTaskModal.vue";
import EditTaskModal from "../components/EditTaskModal.vue";

const router = useRouter();
const { user, logout } = useAuth();
const {
  tasks,
  tasksOnly,
  notes,
  activeTasks,
  completedTasks,
  createTask,
  deleteTask,
  addSubtask,
  updateTask,
  updateSubtask,
  deleteSubtask,
  toggleSubtask,
  uncheckAllSubtasks,
} = useTasks();

// Estado de modales
const showNewTaskModal = ref(false);
const selectedTask = ref<Task | null>(null);      // modal lista subtareas
const editingSubtaskId = ref<string | null>(null);
const subtaskModalTask = ref<Task | null>(null);  // modal nueva subtarea
const showDeleteModal = ref(false);
const taskToDelete = ref<Task | null>(null);
const activeTab = ref<"tasks" | "notes">("tasks");
const itemBeingEdited = ref<Task | null>(null);
 


// Redirección si no hay usuario
watch(
  () => user.value,
  (u) => {
    if (!u) {
      router.push({ name: "login" });
    }
  },
  { immediate: true }
);

// Mantener referencias sincronizadas si cambian las tareas
watch(
  tasks,
  (newTasks) => {
    if (selectedTask.value) {
      const u = newTasks.find((t) => t.id === selectedTask.value?.id);
      if (u) selectedTask.value = u;
    }
    if (subtaskModalTask.value) {
      const u = newTasks.find((t) => t.id === subtaskModalTask.value?.id);
      if (u) subtaskModalTask.value = u;
    }
    if (taskToDelete.value) {
      const u = newTasks.find((t) => t.id === taskToDelete.value?.id);
      if (u) taskToDelete.value = u;
    }
  },
  { deep: true }
);



// Crear tarea
async function handleCreateTask(payload: { title: string; type: TaskType; description?: string }) {
  await createTask(payload);
  showNewTaskModal.value = false;
}

// Click en tarjeta: solo abre detalle si tiene subtareas
function onTaskCardClick(task: Task) {
  selectedTask.value = task;
}

// Nueva subtarea (abrir modal)
function openSubtaskModal(task: Task) {
  subtaskModalTask.value = task;
  editingSubtaskId.value = null;
}


// Acciones sobre subtareas (modal lista)
async function handleToggleSubtask(subtaskId: string) {
  if (!selectedTask.value) return;
  await toggleSubtask(selectedTask.value, subtaskId);
}

async function handleUncheckAll() {
  if (!selectedTask.value) return;
  await uncheckAllSubtasks(selectedTask.value);
}

function handleEditSubtask(subtaskId: string) {
  if (!selectedTask.value) return;
  subtaskModalTask.value = selectedTask.value;
  editingSubtaskId.value = subtaskId; // modo edición
}


// Borrar tarea
function openDeleteModal(task: Task) {
  taskToDelete.value = task;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  taskToDelete.value = null;
}

async function confirmDeleteTask() {
  if (!taskToDelete.value) return;
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

function openEditTaskModal(task: Task) {
  itemBeingEdited.value = task;
}

function closeEditTaskModal() {
  itemBeingEdited.value = null;
}

async function handleSaveEditedTask(payload: { title: string; description?: string }) {
  if (!itemBeingEdited.value) return;
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
async function handleSubmitSubtask(payload: {
  title: string;
  description?: string;
  link?: string;
  dueDate?: string;
}) {
  if (!subtaskModalTask.value) return;

  // Crear
  if (!editingSubtaskId.value) {
    await addSubtask(subtaskModalTask.value, {
      title: payload.title,
      description: payload.description,
      link: payload.link,
      dueDate: payload.dueDate,
      done: false,
    });
  } else {
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
  if (!subtaskModalTask.value || !editingSubtaskId.value) return;
  await deleteSubtask(subtaskModalTask.value, editingSubtaskId.value);
  closeSubtaskModal();
}

function getListForItem(item: Task): Task[] {
  if (item.type === "note") {
    return notes.value;
  }

  // Para tareas: usamos lista de activas o completadas
  return item.completed ? completedTasks.value : activeTasks.value;
}

async function moveItemUp(item: Task) {
  const list = getListForItem(item);
  const index = list.findIndex((t) => t.id === item.id);
  if (index <= 0) return;

  const prev = list[index - 1];

  await Promise.all([
    updateTask(item.id, { order: prev.order }),
    updateTask(prev.id, { order: item.order }),
  ]);
}

async function moveItemDown(item: Task) {
  const list = getListForItem(item);
  const index = list.findIndex((t) => t.id === item.id);
  if (index === -1 || index >= list.length - 1) return;

  const next = list[index + 1];

  await Promise.all([
    updateTask(item.id, { order: next.order }),
    updateTask(next.id, { order: item.order }),
  ]);
}



</script>
