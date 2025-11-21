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
      <!-- Toolbar -->
      <section class="task-toolbar">
        <div>
          <div class="task-toolbar-title">Mis tareas</div>
          <div class="task-toolbar-counts">
            Activas: {{ activeTasks.length }} · Completadas: {{ completedTasks.length }}
          </div>
        </div>
        <button class="btn btn-primary" @click="openNewTaskModal">
          + Nueva tarea
        </button>
      </section>

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

              <!-- Añadir subtarea -->
              <button
                class="icon-btn"
                @click="onAddSubtaskQuick(task)"
                title="Añadir subtarea"
              >
                <img
                  src="/subtaskIcon.svg"
                  alt="Añadir subtarea"
                  class="task-card-icon"
                />
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
            <div class="task-card-main">
              <h3 class="task-card-title" style="text-decoration: line-through; color: #6b7280">
                {{ task.title }}
              </h3>
              <p class="task-card-subtitle">
                Todas las subtareas completadas
              </p>
            </div>

            <div class="task-card-icons" @click.stop>
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

      <!-- Si no hay tareas -->
      <section v-if="!activeTasks.length && !completedTasks.length" style="margin-top: 2rem; text-align: center">
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Todavía no tienes tareas. Pulsa <strong>“Nueva tarea”</strong> para crear la primera.
        </p>
      </section>
    </main>

    <!-- Modal: nueva tarea -->
    <div v-if="showNewTaskModal" class="modal-backdrop" @click.self="closeNewTaskModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Nueva tarea</h2>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Nombre de la tarea</label>
            <input
              v-model="newTaskTitle"
              type="text"
              class="input"
              placeholder="Ej. Planificación del proyecto"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeNewTaskModal">
            Cancelar
          </button>
          <button class="btn btn-primary" @click="confirmCreateTask">
            Crear
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: detalle de tarea + subtareas -->
    <div v-if="selectedTask" class="modal-backdrop" @click.self="closeTaskDetails">
      <div class="modal">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div>
              <div class="modal-title">
                {{ selectedTask.title }}
              </div>
              <div class="task-toolbar-counts">
                {{ selectedTaskActiveSubtasks.length }} pendientes ·
                {{ selectedTaskCompletedSubtasks.length }} completadas
              </div>
            </div>
            <!-- Botón añadir subtarea en el título -->
            <button
              class="icon-btn"
              @click="openSubtaskModal(selectedTask)"
              title="Añadir subtarea"
            >
              <img
                src="/subtaskIcon.svg"
                alt="Añadir subtarea"
                class="task-card-icon"
              />
            </button>
          </div>

          <button
            class="btn btn-outline"
            style="font-size: 0.7rem; padding: 0.35rem 0.6rem"
            @click="closeTaskDetails"
          >
            Cerrar
          </button>
        </div>

        <div class="modal-body">
          <!-- Botón desmarcar todas -->
          <button
            v-if="selectedTask.subtasks?.length"
            class="btn btn-outline btn-full"
            style="font-size: 0.75rem"
            @click="handleUncheckAll"
          >
            Desmarcar todas las subtareas
          </button>


          <!-- Subtareas pendientes -->
          <div class="subtasks-section" v-if="selectedTaskActiveSubtasks.length">
            <div class="subtasks-title">Subtareas pendientes</div>
            <div class="subtasks-list">
              <div
                v-for="st in selectedTaskActiveSubtasks"
                :key="st.id"
                class="subtask-row"
              >
                <input
                  class="subtask-checkbox"
                  type="checkbox"
                  :checked="st.done"
                  @change="handleToggleSubtask(st.id)"
                />
                <div class="subtask-main">
                  <div class="subtask-title">
                    {{ st.title }}
                  </div>
                  <div class="subtask-meta">
                    <span v-if="st.dueDate" class="subtask-date">
                      Fecha: {{ st.dueDate }}
                    </span>
                    <span v-if="st.dueDate && st.link"> · </span>
                    <span v-if="st.link">
                      <a
                        class="subtask-link"
                        :href="st.link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        enlace
                      </a>
                    </span>
                    <span v-if="st.description">
                      <span v-if="st.dueDate || st.link"> · </span>
                      {{ st.description }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Subtareas completadas -->
          <div
            class="subtasks-section"
            v-if="selectedTaskCompletedSubtasks.length"
          >
            <div class="subtasks-title">Subtareas completadas</div>
            <div class="subtasks-list">
              <div
                v-for="st in selectedTaskCompletedSubtasks"
                :key="st.id"
                class="subtask-row subtask-row--completed"
              >
                <input
                  class="subtask-checkbox"
                  type="checkbox"
                  :checked="st.done"
                  @change="handleToggleSubtask(st.id)"
                />
                <div class="subtask-main">
                  <div class="subtask-title subtask-title--completed">
                    {{ st.title }}
                  </div>
                  <div class="subtask-meta">
                    <span v-if="st.dueDate" class="subtask-date">
                      Fecha: {{ st.dueDate }}
                    </span>
                    <span v-if="st.dueDate && st.link"> · </span>
                    <span v-if="st.link">
                      <a
                        class="subtask-link"
                        :href="st.link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        enlace
                      </a>
                    </span>
                    <span v-if="st.description">
                      <span v-if="st.dueDate || st.link"> · </span>
                      {{ st.description }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <!-- Modal: nueva subtarea -->
          <div
            v-if="subtaskModalTask"
            class="modal-backdrop"
            @click.self="closeSubtaskModal"
          >
            <div class="modal">
              <div class="modal-header">
                <div class="modal-title">
                  Nueva subtarea
                </div>
                <button
                  class="btn btn-outline"
                  style="font-size: 0.7rem; padding: 0.35rem 0.6rem"
                  @click="closeSubtaskModal"
                >
                  Cerrar
                </button>
              </div>

              <div class="modal-body">
                <p class="form-label" style="margin-bottom: 0.5rem;">
                  Para la tarea: <strong>"{{ subtaskModalTask.title }}"</strong>
                </p>

                <div class="form-group">
                  <label class="form-label">Nombre de la subtarea</label>
                  <input
                    v-model="subtaskTitle"
                    type="text"
                    class="input"
                    placeholder="Nombre de la subtarea"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Fecha (opcional)</label>
                  <input
                    v-model="subtaskDueDate"
                    type="date"
                    class="input"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Enlace (opcional)</label>
                  <input
                    v-model="subtaskLink"
                    type="url"
                    class="input"
                    placeholder="https://..."
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Descripción (opcional)</label>
                  <textarea
                    v-model="subtaskDescription"
                    rows="2"
                    style="resize: vertical; border-radius: 12px; border: 1px solid var(--border); padding: 0.6rem 0.7rem; font-size: 0.8rem; background-color: #f9fafb; outline: none;"
                  ></textarea>
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn btn-outline" @click="closeSubtaskModal">
                  Cancelar
                </button>
                <button class="btn btn-primary" @click="handleAddSubtask">
                  Añadir subtarea
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>



    <!-- Modal: confirmación de borrado -->
    <div
      v-if="showDeleteModal && taskToDelete"
      class="modal-backdrop"
      @click.self="closeDeleteModal"
    >
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Borrar tarea</h2>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            ¿Seguro que quieres borrar la tarea
            <strong>"{{ taskToDelete.title }}"</strong>?
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeDeleteModal">
            Cancelar
          </button>
          <button
            class="btn btn-primary"
            style="background-color: #b91c1c; border-color: #b91c1c"
            @click="confirmDeleteTask"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useTasks, Task } from "@/composables/useTasks";

const router = useRouter();
const { user, logout } = useAuth();
const {
  tasks,
  activeTasks,
  completedTasks,
  createTask,
  deleteTask,
  addSubtask,
  toggleSubtask,
  uncheckAllSubtasks,
} = useTasks();

// Modal nueva tarea
const showNewTaskModal = ref(false);
const newTaskTitle = ref("");

// Modal detalle tarea / subtareas
const selectedTask = ref<Task | null>(null);
const subtaskModalTask = ref<Task | null>(null);

// Modal confirmación borrado
const showDeleteModal = ref(false);
const taskToDelete = ref<Task | null>(null);

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
  await onDeleteTask(taskToDelete.value.id);
  showDeleteModal.value = false;
  taskToDelete.value = null;
}


// Campos formulario nueva subtarea
const subtaskTitle = ref("");
const subtaskDescription = ref("");
const subtaskLink = ref("");
const subtaskDueDate = ref("");

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

// Mantener selectedTask sincronizada si cambian las tareas
watch(
  tasks,
  (newTasks) => {
    if (selectedTask.value) {
      const updated = newTasks.find((t) => t.id === selectedTask.value?.id);
      if (updated) selectedTask.value = updated;
    }
    if (subtaskModalTask.value) {
      const updatedForm = newTasks.find((t) => t.id === subtaskModalTask.value?.id);
      if (updatedForm) subtaskModalTask.value = updatedForm;
    }
  },
  { deep: true }
);

// Nueva tarea
function openNewTaskModal() {
  newTaskTitle.value = "";
  showNewTaskModal.value = true;
}

function closeNewTaskModal() {
  showNewTaskModal.value = false;
}

async function confirmCreateTask() {
  const title = newTaskTitle.value.trim();
  if (!title) return;
  await createTask(title);
  showNewTaskModal.value = false;
  newTaskTitle.value = "";
}


// Abrir/cerrar modal de LISTA de subtareas
function openTaskDetails(task: Task) {
  if (!task.subtasks || !task.subtasks.length) return; // solo si tiene subtareas
  selectedTask.value = task;
}

function closeTaskDetails() {
  selectedTask.value = null;
}

// Click en la tarjeta
function onTaskCardClick(task: Task) {
  // Solo abre lista si tiene subtareas
  if (!task.subtasks || !task.subtasks.length) return;
  openTaskDetails(task);
}

// Abrir/cerrar modal FORM de subtarea
function openSubtaskModal(task: Task) {
  subtaskModalTask.value = task;
  subtaskTitle.value = "";
  subtaskDescription.value = "";
  subtaskLink.value = "";
  subtaskDueDate.value = "";
}

function closeSubtaskModal() {
  subtaskModalTask.value = null;
}

// Botón “+ subtarea” en tarjeta
function onAddSubtaskQuick(task: Task) {
  openSubtaskModal(task);
}

// Subtareas filtradas (para modal de LISTA)
const selectedTaskActiveSubtasks = computed(() =>
  selectedTask.value
    ? selectedTask.value.subtasks.filter((st) => !st.done)
    : []
);

const selectedTaskCompletedSubtasks = computed(() =>
  selectedTask.value
    ? selectedTask.value.subtasks.filter((st) => st.done)
    : []
);

// Añadir subtarea (usa task del modal FORM)
async function handleAddSubtask() {
  if (!subtaskModalTask.value) return;

  const title = subtaskTitle.value.trim();
  if (!title) return;

  await addSubtask(subtaskModalTask.value, {
    title,
    description: subtaskDescription.value.trim() || undefined,
    link: subtaskLink.value.trim() || undefined,
    dueDate: subtaskDueDate.value || undefined,
    done: false,
  });

  subtaskTitle.value = "";
  subtaskDescription.value = "";
  subtaskLink.value = "";
  subtaskDueDate.value = "";
  subtaskModalTask.value = null;
}

// Desmarcar todas (sigue usando selectedTask = modal de LISTA)
async function handleUncheckAll() {
  if (!selectedTask.value) return;
  await uncheckAllSubtasks(selectedTask.value);
}

// Toggle subtarea (desde modal de LISTA)
async function handleToggleSubtask(subtaskId: string) {
  if (!selectedTask.value) return;
  await toggleSubtask(selectedTask.value, subtaskId);
}





// Borrar tarea
async function onDeleteTask(taskId: string) {
  await deleteTask(taskId);
  if (selectedTask.value?.id === taskId) {
    selectedTask.value = null;
  }
}

// Logout
async function onLogout() {
  await logout();
  router.push({ name: "login" });
}




</script>
