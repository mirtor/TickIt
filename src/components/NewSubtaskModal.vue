<template>
  <div class="modal-backdrop" @click.self="handleClose">
    <div class="modal">
      <!-- Header -->
      <div class="modal-header modal-header--row">
        <div class="modal-title modal-title--flex">
          {{ isEdit ? "Editar subtarea" : "Nueva subtarea" }}
        </div>

        <button
          class="btn btn-outline btn-close-x"
          @click="handleClose"
        >
          X
        </button>
      </div>

      <!-- Body -->
      <div class="form-group">
        <div class="label-row">
          <label class="form-label">Nombre de la subtarea</label>
          <span class="field-counter-inline">{{ title.length }}/40</span>
        </div>

        <input
          v-model="title"
          type="text"
          class="input"
          placeholder="Nombre de la subtarea"
          maxlength="40"
          :disabled="isEdit && !isEditing"
        />
      </div>

      <div>
        <div class="form-group">
          <label class="form-label">Fecha (opcional)</label>
          <input
            v-model="dueDate"
            type="date"
            class="input"
            :disabled="isEdit && !isEditing"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Enlace (opcional)</label>
          <input
            v-model="link"
            type="url"
            class="input"
            placeholder="https://..."
            :disabled="isEdit && !isEditing"
          />
        </div>

        <div class="form-group">
          <div class="label-row">
            <label class="form-label">Descripción (opcional)</label>
            <span class="field-counter-inline">{{ description.length }}/400</span>
          </div>

          <textarea
            v-model="description"
            rows="6"
            class="subtask-textarea"
            maxlength="400"
            :disabled="isEdit && !isEditing"
          ></textarea>
        </div>

      </div>

      <!-- Footer -->
      <div class="modal-footer modal-footer--subtask modal-footer--split">
        <!-- Izquierda -->
        <div class="footer-left">
          <button
            v-if="isEdit"
            class="icon-btn icon-btn-danger"
            @click="onDelete"
            title="Borrar subtarea"
          >
            <img
              src="/deleteIcon.svg"
              alt="Borrar subtarea"
              class="task-card-icon"
            />
          </button>
        </div>

        <!-- Centro -->
        <div class="footer-center">
          <!-- EDIT -->
          <button
            v-if="isEdit"
            class="btn"
            :class="isEditing ? 'btn-primary' : 'btn-outline'"
            @click="onToggleEditSave"
          >
            {{ isEditing ? "Guardar" : "Editar" }}
          </button>

          <!-- CREATE -->
          <button
            v-else
            class="btn btn-primary btn-subtask-save"
            @click="onSubmit"
          >
            Añadir subtarea
          </button>
        </div>

        <!-- Derecha -->
        <div class="footer-right">
          <button
            class="btn btn-outline"
            @click="handleClose"
          >
            Cancelar
          </button>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  taskTitle: string;
  mode?: "create" | "edit";
  initialSubtask?: {
    title: string;
    description?: string;
    link?: string;
    dueDate?: string;
  };
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit", payload: {
    title: string;
    description?: string;
    link?: string;
    dueDate?: string;
  }): void;
  (e: "delete"): void;
}>();

const isEdit = computed(() => props.mode === "edit");

// Estado local
const title = ref("");
const description = ref("");
const link = ref("");
const dueDate = ref("");

// Control de modo vista/edición
const isEditing = ref(false);

function loadInitial() {
  const st = props.initialSubtask;
  title.value = st?.title ?? "";
  description.value = st?.description ?? "";
  link.value = st?.link ?? "";
  dueDate.value = st?.dueDate ?? "";
}

// Sync inicial
watch(
  () => props.initialSubtask,
  () => {
    loadInitial();
  },
  { immediate: true }
);

// Al cambiar modo
watch(
  () => props.mode,
  (m) => {
    // Si es create -> editable desde el inicio
    // Si es edit -> modo vista por defecto
    isEditing.value = m !== "edit";
  },
  { immediate: true }
);

function reset() {
  title.value = "";
  description.value = "";
  link.value = "";
  dueDate.value = "";
}

function handleClose() {
  if (isEdit.value) {
    // si estaba editando y cierras, volvemos a valores originales
    loadInitial();
    isEditing.value = false;
  } else {
    reset();
  }
  emit("close");
}

function onToggleEditSave() {
  if (!isEdit.value) return;

  if (!isEditing.value) {
    isEditing.value = true;
    return;
  }

  onSubmit();
}



function onSubmit() {
  const t = title.value.trim().slice(0, 40);
  if (!t) return;

  // En edit, si no estás en edición, no hacemos nada
  if (isEdit.value && !isEditing.value) return;

  const desc = description.value.trim();
  const lnk = link.value.trim();
  const date = dueDate.value || "";

  emit("submit", {
    title: t,
    description: desc ? desc.slice(0, 400) : undefined,
    link: lnk || undefined,
    dueDate: date || undefined,
  });

  if (!isEdit.value) {
    reset();
  } else {
    isEditing.value = false;
  }
}

function onDelete() {
  emit("delete");
}
</script>

<style scoped>
.modal-header--row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-title--flex {
  flex: 1;
}

.btn-close-x {
  font-size: 0.7rem;
  padding: 0.35rem 0.6rem;
  font-weight: 700;
}

.form-label--taskref {
  margin-bottom: 0.5rem;
}

.subtask-textarea {
  resize: vertical;
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 0.6rem 0.7rem;
  font-size: 0.8rem;
  background-color: #f9fafb;
  outline: none;
  text-align: justify;
}

.modal-footer--subtask {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-subtask-save {
  flex: 1;
}

.label-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.field-counter-inline {
  font-size: 0.7rem;
  color: var(--text-muted);
  line-height: 1;
}

/* Opcional: feedback visual cuando está en modo vista */
.input:disabled,
.subtask-textarea:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.modal-footer--split {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.footer-left,
.footer-center,
.footer-right {
  display: flex;
  align-items: center;
}

.footer-center {
  flex: 1;
  justify-content: center;
}

.footer-left {
  min-width: 44px; /* para que el centro quede bien alineado aunque no haya papelera */
}

.footer-right {
  justify-content: flex-end;
}

.btn-subtask-save {
  min-width: 160px;
}

</style>
