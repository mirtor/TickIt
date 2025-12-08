<template>
  <div class="modal-backdrop">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Actualización disponible</h2>
      </div>

      <div class="modal-body">
        <p class="update-warning-text">
          Hay una nueva versión de la app disponible.
          <br />
          Para continuar, actualiza ahora.
        </p>
      </div>

      <div class="modal-footer">
        <button
          class="btn btn-primary"
          @click="emit('confirm')"
        >
          Actualizar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "confirm"): void;
}>();
</script>

<style scoped>
.update-warning-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
