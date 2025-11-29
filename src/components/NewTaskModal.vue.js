import { ref } from "vue";
const emit = defineEmits();
const title = ref("");
const type = ref("task");
const description = ref("");
function reset() {
    title.value = "";
    type.value = "task";
    description.value = "";
}
function onCancel() {
    reset();
    emit("close");
}
function onCreate() {
    const t = title.value.trim();
    if (!t)
        return;
    emit("create", {
        title: t,
        type: type.value,
        description: type.value === "note" ? description.value : undefined,
    });
    reset();
    emit("close");
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (__VLS_ctx.onCancel) },
    ...{ class: "modal-backdrop" },
});
// @ts-ignore
[onCancel,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "modal-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "auth-tabs" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.type = 'task';
            // @ts-ignore
            [type,];
        } },
    type: "button",
    ...{ class: "auth-tab" },
    ...{ class: ({ 'auth-tab--active': __VLS_ctx.type === 'task' }) },
});
// @ts-ignore
[type,];
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.type = 'note';
            // @ts-ignore
            [type,];
        } },
    type: "button",
    ...{ class: "auth-tab" },
    ...{ class: ({ 'auth-tab--active': __VLS_ctx.type === 'note' }) },
});
// @ts-ignore
[type,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.input)({
    value: (__VLS_ctx.title),
    type: "text",
    ...{ class: "input" },
    placeholder: "Nombre de la tarea o nota",
});
// @ts-ignore
[title,];
if (__VLS_ctx.type === 'note') {
    // @ts-ignore
    [type,];
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.description),
        rows: "4",
        ...{ style: {} },
        placeholder: "Escribe tu nota. Cada salto de línea se mostrará como un punto.",
    });
    // @ts-ignore
    [description,];
}
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.onCancel) },
    ...{ class: "btn btn-outline" },
});
// @ts-ignore
[onCancel,];
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.onCreate) },
    ...{ class: "btn btn-primary" },
});
// @ts-ignore
[onCreate,];
/** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab--active']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tab--active']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
});
export default {};
