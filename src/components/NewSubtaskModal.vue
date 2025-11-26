<template>
  <div class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">
          {{ isEdit ? "Editar subtarea" : "Nueva subtarea" }}
        </div>
        <button
          class="btn btn-outline"
          style="font-size: 0.7rem; padding: 0.35rem 0.6rem"
          @click="onCancel"
        >
          Cerrar
        </button>
      </div>

      <div class="modal-body">
        <p class="form-label" style="margin-bottom: 0.5rem;">
          Para la tarea: <strong>"{{ taskTitle }}"</strong>
        </p>

        <div class="form-group">
          <label class="form-label">Nombre de la subtarea</label>
          <input
            v-model="title"
            type="text"
            class="input"
            placeholder="Nombre de la subtarea"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Fecha (opcional)</label>
          <input
            v-model="dueDate"
            type="date"
            class="input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Enlace (opcional)</label>
          <input
            v-model="link"
            type="url"
            class="input"
            placeholder="https://..."
          />
        </div>

        <div class="form-group">
          <label class="form-label">Descripción (opcional)</label>
          <textarea
            v-model="description"
            rows="2"
            style="resize: vertical; border-radius: 12px; border: 1px solid var(--border); padding: 0.6rem 0.7rem; font-size: 0.8rem; background-color: #f9fafb; outline: none;"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline" @click="onCancel">
          Cancelar
        </button>

        <!-- Botón borrar solo en modo edición -->
        <button
          v-if="isEdit"
          class="btn btn-outline"
          style="border-color: #fecaca; color: #b91c1c; margin-right: auto;"
          @click="onDelete"
        >
          Eliminar subtarea
        </button>

        <button class="btn btn-primary" @click="onSubmit">
          {{ isEdit ? "Guardar cambios" : "Añadir subtarea" }}
        </button>
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

const title = ref("");
const description = ref("");
const link = ref("");
const dueDate = ref("");

// Cuando cambien los datos iniciales (modo edición), sincronizamos
watch(
  () => props.initialSubtask,
  (st) => {
    if (!st) {
      reset();
      return;
    }
    title.value = st.title ?? "";
    description.value = st.description ?? "";
    link.value = st.link ?? "";
    dueDate.value = st.dueDate ?? "";
  },
  { immediate: true }
);

function reset() {
  title.value = "";
  description.value = "";
  link.value = "";
  dueDate.value = "";
}

function onCancel() {
  reset();
  emit("close");
}

function onSubmit() {
  const t = title.value.trim();
  if (!t) return;

  emit("submit", {
    title: t,
    description: description.value.trim() || undefined,
    link: link.value.trim() || undefined,
    dueDate: dueDate.value || undefined,
  });
}

function onDelete() {
  emit("delete");
}
</script>
