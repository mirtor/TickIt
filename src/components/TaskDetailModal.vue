<template>
  <div class="modal-backdrop" @click.self="onClose">
    <div class="modal">

      <div class="modal-header">

        <div style="display: flex; align-items: center; gap: 0.5rem;">

          <div style="display: inline-block; flex: 1;">
            <!-- Título -->
            <div class="modal-title" style="text-align: left;">
              {{ task.title }}
            </div>

            <!-- Pndt / Compl -->
            <div class="task-toolbar-counts">
              {{ activeSubtasks.length }} pendientes ·
              {{ completedSubtasks.length }} completadas
            </div>

          </div>

          <button
            class="btn btn-outline"
            style="font-size: 0.7rem; padding: 0.35rem 0.6rem; font-weight: bold;"
            @click="onClose"
          >
            X
          </button> 

        </div>
      </div>


      <div class="modal-body">
        
        <!-- Subtareas pendientes -->
        <div class="subtasks-section" v-if="activeSubtasks.length">
          <hr>
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

              <!-- Acciones subtarea -->
              <div class="subtask-actions">
                <button
                  class="icon-btn"
                  @click="emit('edit-subtask', st.id)"
                  title="Editar subtarea"
                >
                  <img src="/editIcon.svg" alt="Editar" class="task-card-icon" />
                </button>

              </div>

            </div>
          </div>
        </div>

        <!-- New task -->
        <button
          class="btn btn-primary"
          @click="emit('open-new-subtask')"
          title="Añadir subtarea"
        >
          Nueva subtarea
        </button>

        <!-- Subtareas completadas -->
        <div
          class="subtasks-section"
          v-if="completedSubtasks.length"
        >
          <hr>
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

              <!-- Acciones subtarea -->
              <div class="subtask-actions">
                <button
                  class="icon-btn"
                  @click="emit('edit-subtask', st.id)"
                  title="Editar subtarea"
                >
                  <img src="/editIcon.svg" alt="Editar" class="task-card-icon" />
                </button>

              </div>
            </div>
          </div>
        </div>

        <!-- Desmarcar -->
        <button
          v-if="task.subtasks && task.subtasks.length"
          class="btn btn-outline btn-full"
          style="font-size: 0.75rem"
          @click="emit('uncheck-all')"
        >
          Desmarcar todas las subtareas
        </button>

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
  (e: "edit-subtask", id: string): void;
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

<style scoped>
.subtask-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: 0.25rem;
}
</style>
