<template>
  <div class="modal-backdrop" @click.self="emit('cancel')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Compartir con (Indicar email):</h2>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <div class="input-with-button">
            <input
              v-model="email"
              type="email"
              class="input"
              :class="{ 'input--error': error }"
              placeholder="usuario@email.com"
              @input="error = ''"
              @keyup.enter="onShare"
            />
            <button 
              class="btn btn-primary btn-share-icon" 
              :disabled="!email || isLoading" 
              @click="onShare"
              title="Compartir"
            >
              <img v-if="!isLoading" src="/shareIcon.svg" alt="Compartir" class="btn-icon-img" />
              <span v-else>...</span>
            </button>
          </div>
          <p v-if="error" class="error-text">{{ error }}</p>
        </div>

        <div class="members-section" v-if="members.length > 0">
          <label class="modal-title">Tiene acceso:</label>
          <ul class="members-list">
            <li v-for="member in members" :key="member.uid" class="member-item">
              <template v-if="confirmingRemoveUid !== member.uid">
                <span class="member-email">{{ member.email || 'Colaborador' }}</span>
                <button class="remove-btn" @click="askConfirmRemove(member.uid)" title="Quitar acceso">
                  ×
                </button>
              </template>

              <template v-else>
                <span class="confirm-text">¿Quitar acceso?</span>
                <div class="confirm-actions">
                  <button class="btn-confirm btn-confirm--yes" @click="handleRemoveMember(member.uid)">Sí</button>
                  <button class="btn-confirm btn-confirm--no" @click="confirmingRemoveUid = null">No</button>
                </div>
              </template>
            </li>
          </ul>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline full-width" @click="emit('cancel')">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSharing } from "@/composables/useSharing";
import { useAuth } from "@/composables/useAuth";

const props = defineProps<{ task: any }>();
const emit = defineEmits<{ (e: "cancel"): void; (e: "share", email: string): void }>();

const { user } = useAuth();
const { resolveEmailToUid, getTaskMembers, removeMember } = useSharing();

const email = ref("");
const error = ref("");
const isLoading = ref(false);
const members = ref<any[]>([]);
const confirmingRemoveUid = ref<string | null>(null); // Estado para el confirm propio

async function loadMembers() {
  if (!props.task?.id || props.task.userId !== user.value?.uid) return;
  try {
    isLoading.value = true;
    members.value = await getTaskMembers(props.task.id);
  } catch (e: any) {
    if (e.code === 'permission-denied') error.value = "Sin permisos de lectura.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadMembers);

async function onShare() {
  if (!email.value || isLoading.value) return;
  error.value = "";
  isLoading.value = true;
  
  try {
    const targetUid = await resolveEmailToUid(email.value);
    if (!targetUid) {
      error.value = "El email no está registrado.";
      return;
    }
    if (targetUid === user.value?.uid) {
      error.value = "No puedes compartir contigo mismo.";
      return;
    }

    emit("share", email.value);
    email.value = ""; 
    setTimeout(loadMembers, 1000); 
  } catch (e) {
    error.value = "Error al compartir.";
  } finally {
    isLoading.value = false;
  }
}

function askConfirmRemove(uid: string) {
  confirmingRemoveUid.value = uid;
}

async function handleRemoveMember(uid: string) {
  try {
    await removeMember(props.task.id, uid);
    confirmingRemoveUid.value = null;
    await loadMembers();
  } catch (e) {
    error.value = "No se pudo eliminar.";
  }
}
</script>

<style scoped>
.input-with-button {
  display: flex;
  gap: 0.5rem;
}

/* Botón con el icono de compartir */
.btn-share-icon {
  padding: 0 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
}
.btn-icon-img {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1); /* Pone el icono blanco si el botón es oscuro */
}

.members-section {
  margin-top: 1.5rem;
}
.members-list {
  list-style: none;
  padding: 0;
  margin-top: 0.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
}
.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid #eee;
  min-height: 45px;
}
.member-item:last-child { border-bottom: none; }
.member-email { font-size: 0.85rem; color: #374151; }

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.4rem;
  cursor: pointer;
  line-height: 1;
}

/* Estilos para la confirmación interna */
.confirm-text {
  font-size: 0.8rem;
  color: #ef4444;
  font-weight: bold;
}
.confirm-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-confirm {
  border: none;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}
.btn-confirm--yes { background: #ef4444; color: white; }
.btn-confirm--no { background: #e5e7eb; color: #374151; }

.error-text { color: #dc2626; font-size: 0.75rem; margin-top: 0.3rem; }
.full-width { width: 100%; }
</style>