<template>
  <div class="modal-backdrop" @click.self="onClose">
    <div class="modal">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div>
            <div class="modal-title">
              {{ task.title }}
            </div>
            <div class="task-toolbar-counts">
              {{ activeSubtasks.length }} pendientes ·
              {{ completedSubtasks.length }} completadas
            </div>
          </div>
          <button
            class="icon-btn"
            @click="emit('open-new-subtask')"
            title="Añadir subtarea"
          >
            <img
              src="/subtaskIcon.svg"
              alt="Añadir subtarea"
              class="task-card-icon"
            />
          </button>
        </div>

        <button
          class="btn btn-outline"
          style="font-size: 0.7rem; padding: 0.35rem 0.6rem"
          @click="onClose"
        >
          Cerrar
        </button>
      </div>

      <div class="modal-body">
        <button
          v-if="task.subtasks && task.subtasks.length"
          class="btn btn-outline btn-full"
          style="font-size: 0.75rem"
          @click="emit('uncheck-all')"
        >
          Desmarcar todas las subtareas
        </button>

        <!-- Subtareas pendientes -->
        <div class="subtasks-section" v-if="activeSubtasks.length">
          <div class="subtasks-title">Subtareas pendientes</div>
          <div class="subtasks-list">
            <div
              v-for="st in activeSubtasks"
              :key="st.id"
              class="subtask-row"
            >
              <input
                class="subtask-checkbox"
                type="checkbox"
                :checked="st.done"
                @change="emit('toggle-subtask', st.id)"
              />
              <div class="subtask-main">
                <div class="subtask-title">
                  {{ st.title }}
                </div>
                <div class="subtask-meta">
                  <span v-if="st.dueDate" class="subtask-date">
                    Fecha: {{ st.dueDate }}
                  </span>
                  <span v-if="st.dueDate && st.link"> · </span>
                  <span v-if="st.link">
                    <a
                      class="subtask-link"
                      :href="st.link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      enlace
                    </a>
                  </span>
                  <span v-if="st.description">
                    <span v-if="st.dueDate || st.link"> · </span>
                    {{ st.description }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subtareas completadas -->
        <div
          class="subtasks-section"
          v-if="completedSubtasks.length"
        >
          <div class="subtasks-title">Subtareas completadas</div>
          <div class="subtasks-list">
            <div
              v-for="st in completedSubtasks"
              :key="st.id"
              class="subtask-row subtask-row--completed"
            >
              <input
                class="subtask-checkbox"
                type="checkbox"
                :checked="st.done"
                @change="emit('toggle-subtask', st.id)"
              />
              <div class="subtask-main">
                <div class="subtask-title subtask-title--completed">
                  {{ st.title }}
                </div>
                <div class="subtask-meta">
                  <span v-if="st.dueDate" class="subtask-date">
                    Fecha: {{ st.dueDate }}
                  </span>
                  <span v-if="st.dueDate && st.link"> · </span>
                  <span v-if="st.link">
                    <a
                      class="subtask-link"
                      :href="st.link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      enlace
                    </a>
                  </span>
                  <span v-if="st.description">
                    <span v-if="st.dueDate || st.link"> · </span>
                    {{ st.description }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "@/composables/useTasks";

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "toggle-subtask", id: string): void;
  (e: "uncheck-all"): void;
  (e: "open-new-subtask"): void;
}>();

const activeSubtasks = computed(() =>
  props.task.subtasks?.filter((s) => !s.done) ?? []
);

const completedSubtasks = computed(() =>
  props.task.subtasks?.filter((s) => s.done) ?? []
);

function onClose() {
  emit("close");
}
</script>
