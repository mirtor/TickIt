// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";
import TasksView from "@/views/TasksView.vue";
import { useAuth } from "@/composables/useAuth";
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/login",
            name: "login",
            component: LoginView,
        },
        {
            path: "/app",
            name: "tasks",
            component: TasksView,
            meta: { requiresAuth: true },
        },
        {
            path: "/",
            redirect: "/app",
        },
    ],
});
router.beforeEach((to, from, next) => {
    const { user, loading } = useAuth();
    if (loading.value) {
        // mientras carga el estado de auth, dejamos pasar;
        // la propia vista puede manejar redirecciones si hace falta
        return next();
    }
    if (to.meta.requiresAuth && !user.value) {
        return next({ name: "login" });
    }
    if (to.name === "login" && user.value) {
        return next({ name: "tasks" });
    }
    next();
});
export default router;
