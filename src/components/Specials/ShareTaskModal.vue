<template>
  <div class="modal-backdrop" @click.self="emit('cancel')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Compartir</h2>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Añadir persona por correo</label>
          <div class="input-with-button">
            <input
              v-model="email"
              type="email"
              class="input"
              :class="{ 'input--error': error }"
              placeholder="usuario@email.com"
              @input="error = ''"
            />
            <button 
              class="btn btn-primary btn-add" 
              :disabled="!email || isLoading" 
              @click="onShare"
            >
              {{ isLoading ? '...' : '+' }}
            </button>
          </div>
          <p v-if="error" class="error-text">{{ error }}</p>
        </div>

        <div class="members-section" v-if="members.length > 0">
          <label class="form-label">Acceso compartido:</label>
          <ul class="members-list">
            <li v-for="member in members" :key="member.uid" class="member-item">
              <span class="member-email">{{ member.addedByEmail === member.email ? 'Usuario' : (member.email || 'Colaborador') }}</span>
              <button class="remove-btn" @click="handleRemoveMember(member.uid)" title="Quitar acceso">
                ×
              </button>
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

const props = defineProps<{ task: any }>();
const emit = defineEmits<{ (e: "cancel"): void; (e: "share", email: string): void }>();

const { resolveEmailToUid, getTaskMembers, removeMember } = useSharing();
const email = ref("");
const error = ref("");
const isLoading = ref(false);
const members = ref<any[]>([]);

async function loadMembers() {
  members.value = await getTaskMembers(props.task.id);
}

onMounted(loadMembers);

async function onShare() {
  if (!email.value) return;
  isLoading.value = true;
  try {
    const targetUid = await resolveEmailToUid(email.value);
    if (!targetUid) {
      error.value = "Usuario no encontrado.";
    } else {
      emit("share", email.value);
      email.value = ""; // Limpiar
      setTimeout(loadMembers, 1000); // Recargar lista tras un segundo
    }
  } catch (e) {
    error.value = "Error al buscar.";
  } finally {
    isLoading.value = false;
  }
}

async function handleRemoveMember(uid: string) {
  if (confirm("¿Dejar de compartir con este usuario?")) {
    await removeMember(props.task.id, uid);
    await loadMembers();
  }
}
</script>

<style scoped>
.input-with-button {
  display: flex;
  gap: 0.5rem;
}
.btn-add {
  padding: 0 1rem;
  font-size: 1.2rem;
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
}
.member-item:last-child {
  border-bottom: none;
}
.member-email {
  font-size: 0.85rem;
  color: #374151;
}
.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.4rem;
  cursor: pointer;
  line-height: 1;
}
.error-text { color: #dc2626; font-size: 0.75rem; margin-top: 0.3rem; }
.full-width { width: 100%; }
</style>