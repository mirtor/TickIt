import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
const router = useRouter();
const { user, login, register, loginWithGoogle } = useAuth();
const mode = ref("login");
const email = ref("");
const password = ref("");
const submitting = ref(false);
const error = ref(null);
watch(() => user.value, (u) => {
    if (u) {
        router.push({ name: "tasks" });
    }
}, { immediate: true });
async function onSubmit() {
    error.value = null;
    submitting.value = true;
    try {
        if (mode.value === "login") {
            await login(email.value, password.value);
        }
        else {
            await register(email.value, password.value);
        }
    }
    catch (e) {
        error.value = e.message ?? "Error de autenticación";
    }
    finally {
        submitting.value = false;
    }
}
async function onGoogle() {
    error.value = null;
    submitting.value = true;
    try {
        await loginWithGoogle();
    }
    catch (e) {
        error.value = e.message ?? "Error al iniciar sesión con Google";
    }
    finally {
        submitting.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "auth-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "auth-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.img)({
    src: "/TickitIcon.svg",
    alt: "",
    ...{ class: "icon-tickit" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "auth-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "auth-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "auth-tabs" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.mode = 'login';
            // @ts-ignore
            [mode,];
        } },
    ...{ class: "auth-tab" },
    ...{ class: ({ 'auth-tab--active': __VLS_ctx.mode === 'login' }) },
});
// @ts-ignore
[mode,];
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.mode = 'register';
            // @ts-ignore
            [mode,];
        } },
    ...{ class: "auth-tab" },
    ...{ class: ({ 'auth-tab--active': __VLS_ctx.mode === 'register' }) },
});
// @ts-ignore
[mode,];
__VLS_asFunctionalElement(__VLS_intrinsics.form, __VLS_intrinsics.form)({
    ...{ onSubmit: (__VLS_ctx.onSubmit) },
    ...{ class: "form" },
});
// @ts-ignore
[onSubmit,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.input)({
    type: "email",
    required: true,
    autocomplete: "email",
    ...{ class: "input" },
    placeholder: "tucorreo@ejemplo.com",
});
(__VLS_ctx.email);
// @ts-ignore
[email,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.input)({
    type: "password",
    required: true,
    minlength: "6",
    autocomplete: "current-password",
    ...{ class: "input" },
    placeholder: "Mínimo 6 caracteres",
});
(__VLS_ctx.password);
// @ts-ignore
[password,];
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    type: "submit",
    ...{ class: "btn btn-primary btn-full" },
    disabled: (__VLS_ctx.submitting),
});
// @ts-ignore
[submitting,];
(__VLS_ctx.mode === 'login' ? 'Entrar' : 'Crear cuenta');
// @ts-ignore
[mode,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "divider" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "divider-line" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "divider-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "divider-line" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.onGoogle) },
    type: "button",
    ...{ class: "btn btn-outline btn-full" },
    disabled: (__VLS_ctx.submitting),
});
// @ts-ignore
[submitting, onGoogle,];
__VLS_asFunctionalElement(__VLS_intrinsics.img)({
    src: "/googleIcon.ico",
    alt: "",
    ...{ class: "icon-google" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
if (__VLS_ctx.error) {
    // @ts-ignore
    [error,];
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "auth-error" },
    });
    (__VLS_ctx.error);
    // @ts-ignore
    [error,];
}
/** @type {__VLS_StyleScopedClasses['auth-page']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-tickit']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-title']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab--active']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab--active']} */ ;
/** @type {__VLS_StyleScopedClasses['form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-full']} */ ;
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-line']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-text']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-line']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-full']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-google']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-error']} */ ;
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
