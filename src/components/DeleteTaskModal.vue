<template>
  <div class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Borrar tarea</h2>
      </div>

      <div class="modal-body">
        <p class="delete-warning-text">
          ¿Seguro que quieres borrar la tarea
          <strong>"{{ taskTitle }}"</strong>?
          <br />
          Esta acción no se puede deshacer.
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline" @click="onCancel">
          Cancelar
        </button>

        <button
          class="btn btn-primary btn-danger"
          @click="emit('confirm')"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  taskTitle: string;
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "confirm"): void;
}>();

function onCancel() {
  emit("cancel");
}
</script>

<style scoped>
.delete-warning-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Variante roja del botón */
.btn-danger {
  background-color: #b91c1c;
  border-color: #b91c1c;
}

/* Por si tu .btn-primary tiene hover propio */
.btn-danger:hover {
  filter: brightness(0.95);
}
</style>
