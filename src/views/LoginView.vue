<template>
  <div v-if="loading" class="auth-page">
    <div class="auth-card auth-card--loading">
      <img src="/4-dots-rotate.svg" alt="Cargando" class="loading-spinner" />
      <div class="loading-text">Cargando sesión…</div>

      <button v-if="showRetry" type="button" class="btn btn-outline btn-full" @click="onRetry">
        Reintentar
      </button>
    </div>
  </div>

  <div class="auth-page">
    <div class="auth-card">
      <img src="/TickitIcon.svg" alt="" class="icon-tickit">
      <h1 class="auth-title">Tickit</h1>
      <p class="auth-subtitle">
        Organiza tus tareas desde cualquier dispositivo.
      </p>

      <div class="auth-tabs">
        <button
          class="auth-tab"
          :class="{ 'auth-tab--active': mode === 'login' }"
          @click="mode = 'login'"
        >
          Iniciar sesión
        </button>
        <button
          class="auth-tab"
          :class="{ 'auth-tab--active': mode === 'register' }"
          @click="mode = 'register'"
        >
          Crear cuenta
        </button>
      </div>

      <form class="form" @submit.prevent="onSubmit">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="input"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            autocomplete="current-password"
            class="input"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-full"
          :disabled="submitting"
        >
          {{ mode === 'login' ? 'Entrar' : 'Crear cuenta' }}
        </button>
      </form>

      <div class="divider">
        <span class="divider-line"></span>
        <span class="divider-text">o</span>
        <span class="divider-line"></span>
      </div>

      <button
        type="button"
        class="btn btn-outline btn-full"
        @click="onGoogle"
        :disabled="submitting"
      >
        <img src="/googleIcon.ico" alt="" class="icon-google">
        <span>Sign in with Google</span>
      
      </button>

      <p v-if="error" class="auth-error">
        {{ error }}
      </p>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const { user, loading, login, register, loginWithGoogle, logout } = useAuth();

const mode = ref<"login" | "register">("login");
const email = ref("");
const password = ref("");
const submitting = ref(false);
const error = ref<string | null>(null);
const showRetry = ref(false);
let retryTimer: number | null = null;

watch(() => user.value, (u) => { if (u) router.push({ name: "tasks" }); }, { immediate: true });

watch(() => loading.value, (v) => {
  if (!v) {
    showRetry.value = false;
    if (retryTimer) window.clearTimeout(retryTimer);
  }
});

async function onSubmit() {
  error.value = null;
  submitting.value = true;
  try {
    if (mode.value === "login") await login(email.value, password.value);
    else await register(email.value, password.value);
  } catch (e: any) {
    error.value = e.message ?? "Error de autenticación";
  } finally {
    submitting.value = false;
  }
}

async function onGoogle() {
  error.value = null;
  submitting.value = true;
  try {
    await loginWithGoogle();
  } catch (e: any) {
    error.value = e.message ?? "Error al iniciar sesión con Google";
  } finally {
    submitting.value = false;
  }
}

async function onRetry() {
  try { await logout(); } catch {}
  window.location.reload();
}

onMounted(() => {
  retryTimer = window.setTimeout(() => {
    if (loading.value) showRetry.value = true;
  }, 8000);
});

onUnmounted(() => {
  if (retryTimer) window.clearTimeout(retryTimer);
});

</script>

<style scoped>
  .auth-card--loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.loading-spinner {
  width: 56px;
  height: 56px;
}

.loading-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

</style>