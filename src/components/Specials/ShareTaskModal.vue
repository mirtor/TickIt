<template>
  <div class="modal-backdrop" @click.self="emit('cancel')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Compartir</h2>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            class="input"
            placeholder="usuario@email.com"
          />
        </div>

        <p class="share-hint">
          La persona podrá acceder a esta tarea o nota.
        </p>
      </div>

      <div class="modal-footer modal-footer--split">
        <button class="btn btn-outline" @click="emit('cancel')">
          Cancelar
        </button>

        <button
          class="btn btn-primary"
          :disabled="!email"
          @click="onShare"
        >
          Compartir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "share", email: string): void;
}>();

const email = ref("");

function onShare() {
  emit("share", email.value.trim());
  email.value = "";
}
</script>

<style scoped>
.share-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}
</style>
