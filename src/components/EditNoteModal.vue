<template>
  <div class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <div class="modal-header task-detail-header">
        <div class="task-detail-title-area">
          <div class="modal-title task-detail-title">Editar nota</div>

          <div class="task-toolbar-counts">
            <template v-if="isSharedWithMe(task)">Nota compartida conmigo</template>
            <template v-else-if="isShare">Esta nota está compartida</template>
            <template v-else>Nota privada</template>
          </div>

          <div v-if="props.isLockedByOther" class="edit-lock-banner">
            Editando {{ props.lockedByEmail ? props.lockedByEmail : "otro usuario" }}…
          </div>
        </div>

        <div class="task-detail-header-actions">
          <button v-if="isOwnedByMe(task)" class="icon-btn" title="Compartir" @click="openShare">
            <img v-if="isShare" src="/shareIcon.svg" alt="Compartida" class="task-card-icon" />
            <img v-else src="/noShareIcon.svg" alt="Privada" class="task-card-icon" />
          </button>
        </div>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label form-label--with-counter"><span>Título</span><span class="title-counter-inline">{{ localTitle.length }}/40</span></label>

          <input v-if="isEditing && props.isRealOwner" v-model="localTitle" type="text" class="input" maxlength="40" />
          <div v-else class="title-readonly">{{ localTitle }}</div>

        </div>

        <div class="form-group">
          <label class="form-label">Descripción</label>

          <BulletListInput v-if="isEditing && (props.isRealOwner || props.canEdit)" v-model="localDescription" placeholder="Escribe tu nota… (doble salto = separador)" />


          <div v-else class="note-readonly">
            <ul class="note-readonly-list" v-if="readonlyParts.length">
              <template v-for="(p, idx) in readonlyParts" :key="idx">
                <li v-if="p.type === 'text'" class="note-readonly-item">{{ p.value }}</li>
                <li v-else class="note-readonly-separator" aria-hidden="true"><span class="note-readonly-line"></span></li>
              </template>
            </ul>
            <div v-else class="note-readonly-empty">(Sin descripción)</div>
          </div>
        </div>
      </div>

      <div class="modal-footer modal-footer--split">
        <div class="footer-left">
          <button class="btn" :class="isEditing ? 'btn-primary' : 'btn-outline'" @click="onToggleEditSave" :disabled="(!(props.isRealOwner || props.canEdit) || props.isLockedByOther)" :title="!(props.isRealOwner || props.canEdit) ? 'No tienes permiso para editar' : (props.isLockedByOther ? `En edición por ${props.lockedByEmail ?? 'otro usuario'}` : '')">
            {{ isEditing ? "Guardar" : "Editar" }}
          </button>
        </div>

        <div class="footer-right">
          <button class="btn btn-outline" @click="onCancel">Cancelar</button>
        </div>
      </div>
    </div>

    <ShareTaskModal v-if="showShare" :task="props.task" @cancel="showShare = false" @share="handleShare" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from "vue";
import type { Task } from "@/composables/useTasks";
import BulletListInput from "@/components/Specials/BulletListInput.vue";
import ShareTaskModal from "@/components/Specials/ShareTaskModal.vue";
import { useAuth } from "@/composables/useAuth";
import { useSharing } from "@/composables/useSharing";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase";

const props = defineProps<{
  task: Task;
  canEdit: boolean;
  isRealOwner: boolean;
  isLockedByOther: boolean;
  lockedByEmail: string | null;
  acquireLock: () => Promise<boolean>;
  releaseLock: () => Promise<void>;
}>();

const emit = defineEmits<{ (e: "cancel"): void; (e: "save", payload: { title: string; description?: string }): void }>();

const localTitle = ref(props.task.title);
const localDescription = ref(props.task.description ?? "");
const isEditing = ref(false);

watch(
  () => props.task,
  (t) => {
    if (!isEditing.value) {
      localTitle.value = t.title;
      localDescription.value = t.description ?? "";
    }
  },
  { deep: true }
);


const readonlyParts = computed(() => {
  const raw = (localDescription.value ?? "").split("\n");
  if (!raw.some((l) => l.trim().length)) return [];
  return raw.map((l) => (!l.trim().length ? { type: "sep" as const, value: "" } : { type: "text" as const, value: l }));
});

async function onToggleEditSave() {
  if (!(props.isRealOwner || props.canEdit) || props.isLockedByOther) return;

  if (!isEditing.value) {
    const ok = await props.acquireLock();
    if (!ok) return;
    isEditing.value = true;
    return;
  }

  onSave();
}

async function onCancel() {
  if (isEditing.value) await props.releaseLock();
  isEditing.value = false;
  emit("cancel");
}

function onSave() {
  if (!isEditing.value) return;

  const titleTrimmed = localTitle.value.trim().slice(0, 40);
  if (props.isRealOwner && !titleTrimmed) return;

  emit("save", {
    title: props.isRealOwner ? titleTrimmed : props.task.title,
    description: localDescription.value ?? "",
  });

  isEditing.value = false;
  void props.releaseLock();
}

onUnmounted(() => { if (isEditing.value) void props.releaseLock(); });

const showShare = ref(false);
let unsubMembers: (() => void) | null = null;
const isShare = ref(false);
const { user } = useAuth();
const { shareItem, resolveEmailToUid } = useSharing();

function openShare() { showShare.value = true; }
function isOwnedByMe(item: Task): boolean { return item.userId === user.value?.uid; }
function isSharedWithMe(item: Task): boolean { return !isOwnedByMe(item); }

async function handleShare(email: string) {
  const targetUid = await resolveEmailToUid(email);
  if (!targetUid) { alert("Usuario no encontrado"); return; }
  await shareItem(props.task, targetUid, email);
  showShare.value = false;
}

watch(() => props.task.id, (id) => {
  if (unsubMembers) { unsubMembers(); unsubMembers = null; }
  if (!isOwnedByMe(props.task)) { isShare.value = true; return; }
  const membersRef = collection(db, "tasks", id, "members");
  unsubMembers = onSnapshot(membersRef, (snap) => { isShare.value = !snap.empty; }, () => {});
}, { immediate: true });

onUnmounted(() => { if (unsubMembers) unsubMembers(); });
</script>


<style scoped>
.edit-lock-banner {
  color: var(--primary-soft);
  font-size: 0.75rem;
  padding: 0.4rem 0.6rem 0rem 0.6rem;
  text-align: center;
  font-weight: bold;
}

.task-detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 10px;
}
.task-detail-title-area {
  flex: 1;
  min-width: 0;
}
.task-detail-title {
  text-align: left;
  overflow-wrap: anywhere;
}
.task-detail-header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
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

/* Footer con acciones separadas izquierda/derecha */
.modal-footer--split {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.modal-footer-left,
.modal-footer-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Input en modo lectura */
.input--readonly {
  background: #f9fafb;
  opacity: 0.9;
  cursor: text; /* importante para que parezca seleccionable */
}

/* Vista readonly de la nota */
.note-readonly {
  border: 1px solid var(--border);
  background: #f9fafb;
  border-radius: 12px;
  padding: 0.5rem 0.6rem;
}

.note-readonly-list {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  list-style: none;
}

.note-readonly-item {
  list-style: disc;
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.2rem;
  white-space: pre-wrap;
  word-break: break-word;
  text-align: justify;
}

/* Separador sutil cuando hay línea vacía */
.note-readonly-separator {
  list-style: none;
  padding: 0.1rem 0;
}

.note-readonly-line {
  display: block;
  height: 1px;
  width: 100%;
  background: var(--primary);
  opacity: 1;
}

/* Empty text */
.note-readonly-empty {
  font-size: 0.8rem;
  color: var(--text-muted);
  opacity: 0.7;
}

.title-readonly {
  border: 1px solid var(--border);
  background: #f9fafb;
  border-radius: 12px;
  padding: 0.6rem 0.7rem;
  font-size: 0.9rem;
  line-height: 1.2rem;
  color: inherit;
  text-align: left;

  /* para copiar cómodo */
  cursor: text;
  user-select: text;

  /* por si el título es largo */
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
