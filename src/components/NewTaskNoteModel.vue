<template>
  <div class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Nuevo elemento</h2>
      </div>
      <div class="modal-body">
        <!-- Tipo -->
        <div class="auth-tabs">
          <button type="button" class="auth-tab" :class="{ 'auth-tab--active': type === 'task' }" @click="type = 'task'">Tarea</button>
          <button type="button" class="auth-tab" :class="{ 'auth-tab--active': type === 'note' }" @click="type = 'note'">Nota</button>
        </div>

        <!-- Título -->
        <div class="form-group">
          <label class="form-label form-label--with-counter">
            <span>Título</span>
            <span class="title-counter-inline">{{ title.length }}/40</span>
          </label>
          <input v-model="title" type="text" class="input" placeholder="Nombre de la tarea o nota" maxlength="40" />
        </div>


        <!-- Descripción solo si es nota -->
        <div v-if="type === 'note'" class="form-group">
          <label class="form-label">Descripción</label>
          <BulletListInput
            v-model="description"
            placeholder="Escribe tu nota… (doble salto = separador)"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline" @click="onCancel">Cancelar</button>
        <button class="btn btn-primary" @click="onCreate">Crear</button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { TaskType } from "@/composables/useTasks";
import BulletListInput from "@/components/Specials/BulletListInput.vue";

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
  const t = title.value.trim().slice(0, 40);
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

<style scoped>
.new_note{
  resize: vertical; 
  border-radius: 12px; 
  border: 1px solid var(--border); 
  padding: 0.6rem 0.7rem; 
  font-size: 0.8rem; 
  background-color: #f9fafb; 
  outline: none;
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
</style>
