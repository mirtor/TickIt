<template>
  
  <!-- Animations -->
  <RandomCatAnimation />

  <div class="app-footer-links">
    

    <div class="links-row">
      <div class="link-item">
        <a class="link-url" href="https://tick-it-landing.vercel.app/" target="_blank" rel="noopener noreferrer">WEB</a>
        <button class="icon-btn" title="Copiar" @click="copyText('https://tick-it-landing.vercel.app/')">
          <img src="/copyIcon.svg" alt="Copiar" class="link-icon" />
        </button>
      </div>

      <div class="link-item">
        <a class="link-url" href="https://apptasks-49a0a.web.app/login" target="_blank" rel="noopener noreferrer">APP</a>
        <button class="icon-btn" title="Copiar" @click="copyText('https://apptasks-49a0a.web.app/login')">
          <img src="/copyIcon.svg" alt="Copiar" class="link-icon" />
        </button>
      </div>

      <button class="btn btn-outline btn-small" @click="shareLinks" :title="canNativeShare ? 'Compartir' : 'Copiar enlaces'">
        <img src="/shareIcon.svg" alt="Compartir" class="link-icon" />
        <span>{{ canNativeShare ? "Compartir" : "Copiar enlaces" }}</span>
      </button>
    </div>

    <div v-if="toast" class="links-toast">{{ toast }}</div>

    <div class="version-row">
      <span>Versión 16.01.26</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import RandomCatAnimation from "@/components/Specials/RandomCatAnimation.vue";


const WEB_URL = "https://tick-it-landing.vercel.app/";
const APP_URL = "https://apptasks-49a0a.web.app/login";

const toast = ref<string | null>(null);

const canNativeShare = computed(() => typeof navigator !== "undefined" && !!(navigator as any).share);

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => { toast.value = null; }, 2000);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copiado");
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("Copiado");
    } catch {
      showToast("No se pudo copiar");
    }
  }
}

async function shareLinks() {
  const text = `Tickit\nWeb: ${WEB_URL}\nApp: ${APP_URL}`;

  if (canNativeShare.value) {
    try {
      await (navigator as any).share({ title: "Tickit", text, url: APP_URL });
      return;
    } catch {
      // si cancelan, no hacemos nada
      return;
    }
  }

  await copyText(text);
}
</script>

<style scoped>
.app-footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  margin: 0.25rem 0.25rem 0.5rem;
  text-align: center;
}

.version-row {
  font-size: 10px;
  color: var(--text-muted);
}

.links-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.link-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.25rem 0.4rem;
  background: #f9fafb;
}

.link-icon {
  width: 14px;
  height: 14px;
  opacity: 0.8;
}

.link-url {
  font-size: 11px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: bold;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-small {
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.links-toast {
  font-size: 10px;
  color: var(--text-muted);
}
</style>
