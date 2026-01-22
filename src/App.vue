<template>
  <RouterView />

  <UpdateAppModal
    v-if="showUpdateModal"
    @confirm="applyUpdate"
  />

  <AppFooterLinks />

</template>

<script setup lang="ts">
import { ref } from "vue";
import { registerSW } from "virtual:pwa-register";
import UpdateAppModal from "@/components/UpdateAppModal.vue";
import AppFooterLinks from "@/components/AppFooterLinks.vue";


const showUpdateModal = ref(false);

// registerSW devuelve una función para forzar update
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // aplica el update (skipWaiting) y recarga
    updateSW(true).then(() => window.location.reload());
  },
});

function applyUpdate() {
  updateSW(true);
}
</script>


<style scoped>
.version{
  margin: 5px;
  font-size: 10px;
  text-align: center;
}
</style>