<template>
  <img 
    v-if="isShared" 
    :src="iconSrc" 
    :alt="altText" 
    class="task-card-icon task-card-icon--shared"
    :title="altText"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/composables/useAuth';
import type { Task } from '@/composables/useTasks';

const props = defineProps<{ item: Task }>();
const { user } = useAuth();
const isShared = ref(false);

const isOwnedByMe = computed(() => props.item.userId === user.value?.uid);

const iconSrc = computed(() => 
  isOwnedByMe.value ? '/shareIcon.svg' : '/sharedWithMeIcon.svg'
);

const altText = computed(() => 
  isOwnedByMe.value ? 'Compartida por mí' : 'Compartida conmigo'
);

let unsub: (() => void) | null = null;

onMounted(() => {
  const miUid = user.value?.uid;
  const esMia = props.item.userId === miUid;

  if (!esMia) {
    // Si NO es mía, sé al 100% que es compartida conmigo
    isShared.value = true; 
    return; // IMPORTANTE: Salimos aquí para NO ejecutar el onSnapshot
  }

  // Solo si ES MÍA, pregunto si la he compartido con otros
  const membersRef = collection(db, "tasks", props.item.id, "members");
  unsub = onSnapshot(membersRef, (snap) => {
    isShared.value = !snap.empty;
  }, (err) => {
    // Si aun así da error, lo silenciamos para no ensuciar la consola
    console.debug("Info: No tienes permiso para ver miembros, pero no es crítico.");
  });
});

onUnmounted(() => unsub?.());
</script>