<template>
  <div class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Nuevo elemento</h2>
      </div>
      <div class="modal-body">
        <!-- Tipo -->
        <div class="auth-tabs">
          <button
            type="button"
            class="auth-tab"
            :class="{ 'auth-tab--active': type === 'task' }"
            @click="type = 'task'"
          >
            Tarea
          </button>
          <button
            type="button"
            class="auth-tab"
            :class="{ 'auth-tab--active': type === 'note' }"
            @click="type = 'note'"
          >
            Nota
          </button>
        </div>

        <!-- Título -->
        <div class="form-group">
          <label class="form-label">Título</label>
          <input
            v-model="title"
            type="text"
            class="input"
            placeholder="Nombre de la tarea o nota"
          />
        </div>

        <!-- Descripción solo si es nota -->
        <div v-if="type === 'note'" class="form-group">
          <label class="form-label">Descripción</label>
          <textarea
            v-model="description"
            rows="4"
            style="resize: vertical; border-radius: 12px; border: 1px solid var(--border); padding: 0.6rem 0.7rem; font-size: 0.8rem; background-color: #f9fafb; outline: none;"
            placeholder="Escribe tu nota. Cada salto de línea se mostrará como un punto."
          ></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" @click="onCancel">
          Cancelar
        </button>
        <button class="btn btn-primary" @click="onCreate">
          Crear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { TaskType } from "@/composables/useTasks";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "create", payload: { title: string; type: TaskType; description?: string }): void;
}>();

const title = ref("");
const type = ref<TaskType>("task");
const description = ref("");

function reset() {
  title.value = "";
  type.value = "task";
  description.value = "";
}

function onCancel() {
  reset();
  emit("close");
}

function onCreate() {
  const t = title.value.trim();
  if (!t) return;

  emit("create", {
    title: t,
    type: type.value,
    description: type.value === "note" ? description.value : undefined,
  });

  reset();
  emit("close");
}
</script>
