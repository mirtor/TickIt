<template>
  <div class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">
          Editar {{ isNote ? 'nota' : 'tarea' }}
        </h2>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Título</label>
          <input
            v-model="localTitle"
            type="text"
            class="input"
          />
        </div>

        <div
          v-if="isNote"
          class="form-group"
        >
          <label class="form-label">Descripción</label>
          <textarea
            v-model="localDescription"
            rows="25"
            style="resize: vertical; border-radius: 12px; border: 1px solid var(--border); padding: 0.6rem 0.7rem; font-size: 0.8rem; background-color: #f9fafb; outline: none;"
          ></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" @click="onCancel">
          Cancelar
        </button>
        <button class="btn btn-primary" @click="onSave">
          Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Task } from "@/composables/useTasks";

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "save", payload: { title: string; description?: string }): void;
}>();

const isNote = computed(() => props.task.type === "note");

const localTitle = ref(props.task.title);
const localDescription = ref(props.task.description ?? "");

// Por si cambia la tarea mientras el modal está abierto
watch(
  () => props.task,
  (t) => {
    localTitle.value = t.title;
    localDescription.value = t.description ?? "";
  },
  { deep: true }
);

function onCancel() {
  emit("cancel");
}

function onSave() {
  const title = localTitle.value.trim();
  if (!title) return;

  emit("save", {
    title,
    description: isNote.value ? localDescription.value : undefined,
  });
}
</script>
