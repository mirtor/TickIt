<template>
  <div class="modal-backdrop" @click.self="onClose">
    <div class="modal task-detail-modal">

      <div class="modal-header task-detail-header">
        <!-- Zona título -->
        <button
          class="icon-btn"
          @click="onToggleEditTitle"
          :title="isEditingTitle ? 'Guardar título' : 'Editar título'"
        >
          <img
            v-if="!isEditingTitle"
            src="/editIcon.svg"
            alt="Editar"
            class="task-card-icon"
          />
          <!-- Si no tienes checkIcon.svg, usa el fallback de texto -->
          <span v-else class="check-fallback">✓</span>
        </button>

        <div class="task-detail-title-area">
          <div v-if="!isEditingTitle" class="modal-title task-detail-title">
            {{ task.title }}
          </div>

          <div v-else class="task-detail-title-edit">
            <input
              v-model="localTitle"
              type="text"
              class="input task-detail-title-input"
              maxlength="40"
            />
            <div class="title-counter-inline">
              {{ localTitle.length }}/40
            </div>
          </div>

          <div class="task-toolbar-counts">
            {{ activeSubtasks.length }} pendientes ·
            {{ completedSubtasks.length }} completadas
          </div>

          <!--Compartidos-->
          <div class="task-toolbar-counts">
            <template v-if="isSharedWithMe(task)">
              Compartido por {{ sharedByEmail }}
            </template>

            <template v-else-if="isItemShared(task)">
              Compartida con {{ sharedCount }} personas
            </template>

            <template v-else>
              Tarea privada
            </template>
          </div>

        </div>

        <!-- Acciones header derecha -->
        <div class="task-detail-header-actions">
          <button
            class="btn btn-outline task-detail-close-btn"
            @click="onClose"
            title="Cerrar"
          >
            X
          </button>

          <button v-if="isOwnedByMe(task)" class="icon-btn" title="Compartir" @click="openShare">
            <img v-if="isShare" src="/shareIcon.svg" alt="Compartida" class="task-card-icon"/>
            <img v-else src="/noShareIcon.svg" alt="Privada" class="task-card-icon"/>
          </button>

        </div>
      </div>

      <div class="modal-body task-detail-body">

        <!-- Subtareas pendientes -->
        <div class="subtasks-section" v-if="activeSubtasks.length">
          <hr class="soft-hr">
          <div class="subtasks-title">Subtareas pendientes</div>

          <div class="subtasks-list">
            <div
              v-for="st in activeSubtasks"
              :key="st.id"
              class="subtask-row"
            >
              <input
                class="subtask-checkbox"
                type="checkbox"
                :checked="st.done"
                @change="emit('toggle-subtask', st.id)"
              />

              <div class="subtask-main">
                <div class="subtask-title">
                  {{ st.title }}
                </div>

                <!-- META: Fecha + enlace en la misma línea -->
                <div class="subtask-meta">
                  <div class="subtask-meta-row">
                    <span v-if="st.dueDate" class="subtask-date">
                      Fecha: {{ st.dueDate }}
                    </span>

                    <a
                      v-if="st.link"
                      class="subtask-link"
                      :href="st.link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      enlace
                    </a>
                  </div>

                  <!-- Descripción debajo -->
                  <div
                    v-if="st.description"
                    class="subtask-description"
                  >
                    {{ st.description }}
                  </div>
                </div>
              </div>

              <div class="subtask-actions">
                <button
                  class="icon-btn"
                  @click="emit('edit-subtask', st.id)"
                  title="Editar subtarea"
                >
                  <img src="/editIcon.svg" alt="Editar" class="task-card-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón nueva subtarea -->
        <button
          class="btn btn-primary"
          @click="emit('open-new-subtask')"
          title="Añadir subtarea"
        >
          Nueva subtarea
        </button>

        <!-- Subtareas completadas -->
        <div class="subtasks-section" v-if="completedSubtasks.length">
          <hr class="soft-hr">
          <div class="subtasks-title">Subtareas completadas</div>

          <div class="subtasks-list">
            <div
              v-for="st in completedSubtasks"
              :key="st.id"
              class="subtask-row subtask-row--completed"
            >
              <input
                class="subtask-checkbox"
                type="checkbox"
                :checked="st.done"
                @change="emit('toggle-subtask', st.id)"
              />

              <div class="subtask-main">
                <div class="subtask-title subtask-title--completed">
                  {{ st.title }}
                </div>

                <div class="subtask-meta">
                  <div class="subtask-meta-row">
                    <span v-if="st.dueDate" class="subtask-date">
                      Fecha: {{ st.dueDate }}
                    </span>

                    <a
                      v-if="st.link"
                      class="subtask-link"
                      :href="st.link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      enlace
                    </a>
                  </div>

                  <div
                    v-if="st.description"
                    class="subtask-description"
                  >
                    {{ st.description }}
                  </div>
                </div>
              </div>

              <div class="subtask-actions">
                <button
                  class="icon-btn"
                  @click="emit('edit-subtask', st.id)"
                  title="Editar subtarea"
                >
                  <img src="/editIcon.svg" alt="Editar" class="task-card-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Desmarcar todas -->
        <button
          v-if="task.subtasks && task.subtasks.length"
          class="btn btn-outline btn-full btn-uncheck-all"
          @click="emit('uncheck-all')"
        >
          Desmarcar todas las subtareas
        </button>

      </div>
    </div>

    <ShareTaskModal
      v-if="showShare"
      :task="props.task"
      @cancel="showShare = false"
      @share="handleShare"
    />

  </div>
</template>


<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Task } from "@/composables/useTasks";
import ShareTaskModal from "@/components/Specials/ShareTaskModal.vue";
import { useAuth } from "@/composables/useAuth";
import { useSharing } from "@/composables/useSharing";

const props = defineProps<{ task: Task }>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "toggle-subtask", id: string): void;
  (e: "uncheck-all"): void;
  (e: "open-new-subtask"): void;
  (e: "edit-subtask", id: string): void;
  (e: "update-title", title: string): void;
}>();

const activeSubtasks = computed(() =>
  props.task.subtasks?.filter((s) => !s.done) ?? []
);

const completedSubtasks = computed(() =>
  props.task.subtasks?.filter((s) => s.done) ?? []
);

const isEditingTitle = ref(false);
const localTitle = ref(props.task.title);

watch(
  () => props.task.title,
  (t) => {
    if (!isEditingTitle.value) {
      localTitle.value = t;
    }
  }
);

function onClose() {
  emit("close");
}

function onToggleEditTitle() {
  if (!isEditingTitle.value) {
    // entrar en modo edición
    isEditingTitle.value = true;
    localTitle.value = props.task.title;
    return;
  }

  // guardar
  const t = localTitle.value.trim().slice(0, 40);
  if (!t) return;

  emit("update-title", t);
  isEditingTitle.value = false;
}


const showShare = ref(false);
const isShare = ref(false);
const sharedCount = ref(0);
const sharedByEmail = ref("usuario@email.com");
const { user } = useAuth();
const { shareItem, resolveEmailToUid } = useSharing();

//const isShare = computed(() => members.value.length > 0);
//const sharedCount = computed(() => members.value.length);

function openShare() {
  showShare.value = true;
}

function isItemShared(item: Task): boolean {
  // TODO: más adelante vendrá de members.length > 0
  return false;
}

function isOwnedByMe(item: Task): boolean {
  return item.userId === user.value?.uid;
}

function isSharedWithMe(item: Task): boolean {
  return !isOwnedByMe(item) && isItemShared(item);
}

async function handleShare(email: string) {
  const targetUid = await resolveEmailToUid(email);
  if (!targetUid) {
    alert("Usuario no encontrado");
    return;
  }

  await shareItem(props.task, targetUid, email);
  showShare.value = false;
}




</script>


<style scoped>
.task-detail-title-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.task-detail-modal .modal-header {
  position: relative;
}

.task-detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.task-detail-title-area {
  flex: 1;
  min-width: 0;
}

.task-detail-title {
  text-align: left;
  overflow-wrap: anywhere;
}

.task-detail-title-edit {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.task-detail-title-input {
  flex: 1;
}

.title-counter-inline {
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.task-detail-header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}

.task-detail-close-btn {
  font-size: 0.7rem;
  padding: 0.35rem 0.6rem;
  font-weight: bold;
}

.check-fallback {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
}

/* HR sutil */
.soft-hr {
  opacity: 0.35;
  margin: 0.35rem 0 0.5rem;
}

/* Acciones subtarea */
.subtask-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: 0.25rem;
}

/* Meta layout sin “·” */
.subtask-meta {
  margin-top: 0.15rem;
}

.subtask-meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* "pequeño espacio" */
  font-size: 0.78rem;
  color: var(--text-muted);
}

.subtask-date {
  white-space: nowrap;
}

.subtask-link {
  text-decoration: underline;
}

/* Descripción debajo, justificada y con fade */
.subtask-description {
  position: relative;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: justify;

  max-height: 2.6rem; /* ~2 líneas */
  overflow: hidden;
}

.subtask-description::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1.2rem;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0),
    rgba(255,255,255,1)
  );
  pointer-events: none;
}

/* Botón desmarcar sin inline */
.btn-uncheck-all {
  font-size: 0.75rem;
}

/* Ajuste general del body si quieres evitar overflow raro */
.task-detail-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>

