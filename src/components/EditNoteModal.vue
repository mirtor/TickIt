<template>
  <div class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <div class="modal-header task-detail-header">
        <!-- Zona título -->
        <div class="task-detail-title-area">
          <div class="modal-title task-detail-title">
            Editar nota
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
          <button v-if="isOwnedByMe(task)" class="icon-btn" title="Compartir" @click="openShare">
            <img v-if="isShare" src="/shareIcon.svg" alt="Compartida" class="task-card-icon"/>
            <img v-else src="/noShareIcon.svg" alt="Privada" class="task-card-icon"/>
          </button>
        </div>
      </div>

      <div class="modal-body">
        <!-- TÍTULO -->
        <div class="form-group">
          <label class="form-label form-label--with-counter">
            <span>Título</span>
            <span class="title-counter-inline">{{ localTitle.length }}/40</span>
          </label>

          <!-- Modo edición -->
          <input
            v-if="isEditing"
            v-model="localTitle"
            type="text"
            class="input"
            maxlength="40"
          />

          <!-- Modo lectura (seleccionable) -->
          <div
            v-else
            class="title-readonly"
          >
            {{ localTitle }}
          </div>
        </div>

        <!-- DESCRIPCIÓN -->
        <div class="form-group">
          <label class="form-label">Descripción</label>

          <!-- Modo edición -->
          <BulletListInput
            v-if="isEditing"
            v-model="localDescription"
            placeholder="Escribe tu nota… (doble salto = separador)"
          />

          <!-- Modo lectura (seleccionable) -->
          <div v-else class="note-readonly">
            <ul class="note-readonly-list" v-if="readonlyParts.length">
              <template v-for="(p, idx) in readonlyParts" :key="idx">
                <li
                  v-if="p.type === 'text'"
                  class="note-readonly-item"
                >
                  {{ p.value }}
                </li>

                <li
                  v-else
                  class="note-readonly-separator"
                  aria-hidden="true"
                >
                  <span class="note-readonly-line"></span>
                </li>
              </template>
            </ul>

            <div v-else class="note-readonly-empty">
              (Sin descripción)
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer modal-footer--split">
        <div class="footer-left">
          <button
            class="btn"
            :class="isEditing ? 'btn-primary' : 'btn-outline'"
            @click="onToggleEditSave"
          >
            {{ isEditing ? "Guardar" : "Editar" }}
          </button>
        </div>

        <div class="footer-right">
          <button class="btn btn-outline" @click="onCancel">
            Cancelar
          </button>
        </div>
      </div>

    </div>

    <ShareTaskModal
      v-if="showShare"
      @cancel="showShare = false"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Task } from "@/composables/useTasks";
import BulletListInput from "@/components/Specials/BulletListInput.vue";
import ShareTaskModal from "@/components/Specials/ShareTaskModal.vue";
import { useAuth } from "@/composables/useAuth";

const props = defineProps<{ task: Task }>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "save", payload: { title: string; description?: string }): void;
}>();

// Este modal ya es solo para notas.
// Si quieres blindarlo aún más, podrías lanzar un guard si task.type !== "note".
const localTitle = ref(props.task.title);
const localDescription = ref(props.task.description ?? "");

// Bloqueado por defecto
const isEditing = ref(false);

// Por si cambia la tarea mientras el modal está abierto
watch(
  () => props.task,
  (t) => {
    localTitle.value = t.title;
    localDescription.value = t.description ?? "";
    isEditing.value = false;
  },
  { deep: true }
);

// Construimos una vista readonly que respeta separadores por línea vacía
const readonlyParts = computed(() => {
  const raw = (localDescription.value ?? "").split("\n");

  // Si todo está vacío:
  if (!raw.some((l) => l.trim().length)) return [];

  return raw.map((l) => {
    if (!l.trim().length) {
      return { type: "sep" as const, value: "" };
    }
    return { type: "text" as const, value: l };
  });
});


function onToggleEditSave() {
  if (!isEditing.value) {
    isEditing.value = true;
    return;
  }

  onSave(); // reutiliza tu lógica actual de guardar
  isEditing.value = false;
}


function onCancel() {
  isEditing.value = false;
  emit("cancel");
}

function onSave() {
  if (!isEditing.value) return;

  const title = localTitle.value.trim().slice(0, 40);
  if (!title) return;

  emit("save", {
    title,
    description: localDescription.value ?? "",
  });

  isEditing.value = false;
}


const showShare = ref(false);
const isShare = ref(false);
const sharedCount = ref(0);
const sharedByEmail = ref("usuario@email.com");
const { user } = useAuth();

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



</script>

<style scoped>
  .task-detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 10px;
}
.task-detail-title-area {
  flex: 1;
  min-width: 0;
}
.task-detail-title {
  text-align: left;
  overflow-wrap: anywhere;
}
.task-detail-header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}


.form-label--with-counter {
  display: flex;
  align-items: center;
  justify-content: initial;
  gap: 10px;
}

.title-counter-inline {
  font-size: 0.7rem;
  color: var(--text-muted);
}

/* Footer con acciones separadas izquierda/derecha */
.modal-footer--split {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.modal-footer-left,
.modal-footer-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Input en modo lectura */
.input--readonly {
  background: #f9fafb;
  opacity: 0.9;
  cursor: text; /* importante para que parezca seleccionable */
}

/* Vista readonly de la nota */
.note-readonly {
  border: 1px solid var(--border);
  background: #f9fafb;
  border-radius: 12px;
  padding: 0.5rem 0.6rem;
}

.note-readonly-list {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  list-style: none;
}

.note-readonly-item {
  list-style: disc;
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.2rem;
  white-space: pre-wrap;
  word-break: break-word;
  text-align: justify;
}

/* Separador sutil cuando hay línea vacía */
.note-readonly-separator {
  list-style: none;
  padding: 0.1rem 0;
}

.note-readonly-line {
  display: block;
  height: 1px;
  width: 100%;
  background: var(--primary);
  opacity: 1;
}

/* Empty text */
.note-readonly-empty {
  font-size: 0.8rem;
  color: var(--text-muted);
  opacity: 0.7;
}

.title-readonly {
  border: 1px solid var(--border);
  background: #f9fafb;
  border-radius: 12px;
  padding: 0.6rem 0.7rem;
  font-size: 0.9rem;
  line-height: 1.2rem;
  color: inherit;
  text-align: left;

  /* para copiar cómodo */
  cursor: text;
  user-select: text;

  /* por si el título es largo */
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
