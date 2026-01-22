<template>
  <div class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ headerText }}</h2>
      </div>

      <div class="modal-body">
        <p class="delete-warning-text">
          {{ bodyText }}
          <strong>"{{ itemTitle }}"</strong>?
          <br />
          Esta acción no se puede deshacer.
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline" @click="onCancel">
          Cancelar
        </button>

        <button class="btn btn-primary btn-danger" @click="emit('confirm')">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  taskTitle: string;                 
  entityLabel?: string;              // "tarea" | "nota" | "subtarea" | ...
  header?: string;                   // texto del header, opcional
  confirmLabel?: string;             // texto del botón, opcional
  bodyPrefix?: string;               // "¿Seguro que quieres borrar la ..." opcional
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "confirm"): void;
}>();

function onCancel() {
  emit("cancel");
}

const itemTitle = computed(() => props.taskTitle ?? "");
const label = computed(() => props.entityLabel ?? "tarea");

const headerText = computed(() => props.header ?? `Borrar ${label.value}`);
const confirmText = computed(() => props.confirmLabel ?? "Eliminar");
const bodyText = computed(() => props.bodyPrefix ?? `¿Seguro que quieres borrar la ${label.value} `);
</script>

<style scoped>
.delete-warning-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.btn-danger {
  background-color: #b91c1c;
  border-color: #b91c1c;
}

.btn-danger:hover {
  filter: brightness(0.95);
}
</style>
