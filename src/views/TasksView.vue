<template>
  <div class="task-page">
    <!-- Header -->
    <header class="task-header">
      <div class="task-header-left">
        <img src="/TickitIcon.svg" alt="Tickit" class="task-header-logo" />
      </div>
      <div class="task-header-user">
        <span v-if="user?.email">{{ user.email }}</span>
        <button class="btn btn-outline task-logout-btn" @click="onLogout">Cerrar sesión</button>
      </div>
    </header>

 

    <!-- Contenido principal -->
    <main class="task-main">
      <!-- Botón nueva tarea/nota -->
      <button class="btn btn-primary btn-fixed"  @click.stop.prevent="openNewItemModal" title="Añadir tarea">
        <img src="/addIcon.svg" alt="Editar" class="task-card-icon" />
      </button>

      <!-- Pestaña Tareas/Notas -->
      <div class="auth-tabs tabs-row">
        <button class="auth-tab task-button" :class="{ 'auth-tab--active': activeTab === 'tasks' }" @click="activeTab = 'tasks'">Tareas</button>
        <button class="auth-tab note-button" :class="{ 'auth-tab--active': activeTab === 'notes' }" @click="activeTab = 'notes'" >Notas</button>
      </div>


      <!-- Contenido Tareas -->
      <section v-if="activeTab === 'tasks'">
        <!-- Tareas activas -->
        <section v-if="activeTasks.length" class="task-list-section">

          <h2 class="task-list-title">Tareas activas</h2>

          <div class="task-list">
            <article v-for="task in activeTasks" :key="task.id" class="task-card" @click="onTaskCardClick(task)" >
              <!-- Botones Reordenar -->
              <div class="task-card-icons" @click.stop>         
                <button class="icon-btn" @click="moveItemUp(task)" title="Mover arriba" >↑</button>
                <button class="icon-btn" @click="moveItemDown(task)" title="Mover abajo" >↓</button>
              </div>

              <!-- Lista tareas -->
              <div class="task-card-main">
                <h3 class="task-card-title">{{ task.title }}</h3>

                <p v-if="task.subtasks && task.subtasks.length" class="task-card-subtitle" >
                  {{ task.subtasks.filter((s) => s.done).length }}/{{ task.subtasks.length }} completadas
                </p>
              </div>

              <!-- Botones edición -->
              <div class="task-card-icons" @click.stop>
                <!-- Borrar tarea -->
                <button class="icon-btn icon-btn-danger" @click="openDeleteModal(task)" title="Borrar tarea">
                  <img src="/deleteIcon.svg" alt="Borrar tarea" class="task-card-icon"/>
                </button>

                <!-- Editar tarea -->
                <button class="icon-btn" @click="openEditNoteModal(task)" title="Editar tarea">
                  <img src="/editIcon.svg" alt="Editar" class="task-card-icon" />
                </button>

              </div>
            </article>
          </div>
        </section>

        <!-- Tareas completadas -->
        <section v-if="completedTasks.length" class="task-list-section completed-section">

          <h2 class="task-list-title">Tareas completadas</h2>

          <div class="task-list">
            <article v-for="task in completedTasks" :key="task.id" class="task-card" @click="onTaskCardClick(task)" >
              <!-- Botones Reordenar -->
              <div class="task-card-icons" @click.stop>
                <button  class="icon-btn" @click="moveItemUp(task)" title="Mover arriba">↑</button>
                <button class="icon-btn" @click="moveItemDown(task)" title="Mover abajo">↓</button>
              </div>

              <div class="task-card-main">
                <h3 class="task-card-title task-card-title--completed">{{ task.title }}</h3>
                <p class="task-card-subtitle">
                  {{ task.subtasks?.length ?? 0 }} subtareas completadas
                </p>
              </div>

              <!-- Botones edición -->
              <div class="task-card-icons" @click.stop>
                <!-- Editar tarea -->
                <button class="icon-btn" @click="openEditNoteModal(task)" title="Editar tarea" >
                  <img src="/editIcon.svg" alt="Editar" class="task-card-icon" />
                </button>

                <!-- Borrar tarea -->
                <button class="icon-btn icon-btn-danger" @click="openDeleteModal(task)" title="Borrar tarea">
                  <img src="/deleteIcon.svg" alt="Borrar tarea" class="task-card-icon" />
                </button>
              </div>
            </article>
          </div>
        </section>

      </section>

      <!-- Contenido Notas -->
      <section v-if="activeTab === 'notes'" class="task-list-section">
        <h2 class="task-list-title">Notas</h2>

        <div class="task-list">
          <article v-for="note in notes" :key="note.id" class="task-card task-card--note" @click="openEditNoteModal(note)">
            <!-- Botones Reordenar -->
            <div class="task-card-icons" @click.stop>
              <button class="icon-btn" @click="moveItemUp(note)" title="Mover arriba">↑</button>
              <button class="icon-btn" @click="moveItemDown(note)" title="Mover abajo">↓</button>
            </div>

            <!-- Lista Notas -->
            <div class="task-card-main">
              
              <h3 class="task-card-title">
                {{ note.title }}
              </h3>

              <!-- Descripción como lista de puntos por salto de línea -->
              <ul v-if="note.description" class="note-description-list" >
                <li
                  v-for="(line, idx) in note.description
                    .split('\n')
                    .filter((l) => l.trim().length)
                    .slice(0, 4)"
                  :key="idx"
                >
                  {{ line }}
                </li>
              </ul>
            </div>

            <!-- Botones edición -->
            <div class="task-card-icons" @click.stop>
              <!-- Editar nota -->
              <button class="icon-btn" @click="openEditNoteModal(note)" title="Editar nota">
                <img src="/editIcon.svg" alt="Editar" class="task-card-icon" />
              </button>

              <!-- Borrar nota -->
              <button class="icon-btn icon-btn-danger" @click="openDeleteModal(note)" title="Borrar nota">
                <img src="/deleteIcon.svg" alt="Borrar nota" class="task-card-icon"/>
              </button>
            </div>

          </article>
        </div>

      </section>

      
      <!-- Si no hay tareas -->
      <section v-if="!activeTasks.length && !completedTasks.length" class="empty-state">
        <p class="empty-state-text">
          Todavía no tienes tareas. Pulsa <strong>“Nueva tarea”</strong> para crear la primera.
        </p>
      </section>
    </main>

    <!-- Modal: nueva tarea -->
    <NewTaskNoteModel
      v-if="showNewTaskNoteModel"
      @close="showNewTaskNoteModel = false"
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
      @update-title="handleUpdateTaskTitle"
    />

    <!-- Modal: nueva subtarea -->
    <NewSubtaskModal
      v-if="subtaskModalTask && !showNewTaskNoteModel"
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
    <EditNoteModal
      v-if="itemBeingEdited"
      :task="itemBeingEdited"
      @cancel="closeEditNoteModal"
      @save="handleSaveEditedTask"
    />

  </div>


  <div class="version"><p>Versión 08.12.25</p></div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useTasks, Task, TaskType  } from "@/composables/useTasks";

import NewTaskNoteModel from "@/components/NewTaskNoteModel.vue";
import TaskDetailModal from "@/components/TaskDetailModal.vue";
import NewSubtaskModal from "@/components/NewSubtaskModal.vue";
import DeleteTaskModal from "@/components/DeleteTaskModal.vue";
import EditNoteModal from "@/components/EditNoteModal.vue";

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
const showNewTaskNoteModel = ref(false);
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


function openNewItemModal() {
  // cerrar modales relacionados con tareas/subtareas
  selectedTask.value = null;
  closeSubtaskModal();

  // cerrar borrado/edición
  showDeleteModal.value = false;
  taskToDelete.value = null;
  itemBeingEdited.value = null;

  // abrir nuevo elemento
  showNewTaskNoteModel.value = true;
}

async function handleUpdateTaskTitle(title: string) {
  if (!selectedTask.value) return;
  await updateTask(selectedTask.value.id, { title });
}

// Crear tarea
async function handleCreateTask(payload: { title: string; type: TaskType; description?: string }) {
  await createTask(payload);
  showNewTaskNoteModel.value = false;
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

function openEditNoteModal(task: Task) {
  itemBeingEdited.value = task;
}

function closeEditNoteModal() {
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

<style scoped>
/* Header logout button (antes inline) */
.task-logout-btn {
  font-size: 0.7rem;
  padding: 0.4rem 0.7rem;
}

/* Tabs row (antes inline en el contenedor) */
.tabs-row {
  justify-content: flex-start;
  margin-bottom: 0.75rem;
}

/* Separación de sección completadas */
.completed-section {
  margin-top: 1.25rem;
}

/* Título completado (antes inline) */
.task-card-title--completed {
  text-decoration: line-through;
  color: #6b7280;
}

/* Lista de descripción de notas (antes inline) */
.note-description-list {
  margin: 0.3rem 0 0;
  padding-left: 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Empty state (antes inline) */
.empty-state {
  margin-top: 2rem;
  text-align: center;
}

.empty-state-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Solo afecta a tarjetas de NOTAS */
.task-card--note {
  max-height: 150px;
  overflow: hidden;
  position: relative;
}

/* opcional: efecto de “fade” abajo para indicar que hay más */
.task-card--note::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 36px;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0),
    rgba(255,255,255,1)
  );
  pointer-events: none;
}

/* Asegura que la tarjeta no centre los iconos verticalmente */
.task-card {
  align-items: flex-start;
}

/* Por si alguna columna de iconos hereda centrado del layout */
.task-card-icons {
  align-self: flex-start;
}

.task-card--note .task-card-title {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.task-card--note .note-description-list {
  margin: 0.3rem 0 0;
  padding-left: 1rem;
  font-size: 0.8rem;
  text-align: justify;
  color: var(--text-muted);
}



</style>