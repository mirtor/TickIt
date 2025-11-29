import { computed, ref, watch } from "vue";
const props = defineProps();
const emit = defineEmits();
const isEdit = computed(() => props.mode === "edit");
const title = ref("");
const description = ref("");
const link = ref("");
const dueDate = ref("");
// Cuando cambien los datos iniciales (modo edición), sincronizamos
watch(() => props.initialSubtask, (st) => {
    if (!st) {
        reset();
        return;
    }
    title.value = st.title ?? "";
    description.value = st.description ?? "";
    link.value = st.link ?? "";
    dueDate.value = st.dueDate ?? "";
}, { immediate: true });
function reset() {
    title.value = "";
    description.value = "";
    link.value = "";
    dueDate.value = "";
}
function onCancel() {
    reset();
    emit("close");
}
function onSubmit() {
    const t = title.value.trim();
    if (!t)
        return;
    emit("submit", {
        title: t,
        description: description.value.trim() || undefined,
        link: link.value.trim() || undefined,
        dueDate: dueDate.value || undefined,
    });
}
function onDelete() {
    emit("delete");
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
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-title" },
    ...{ style: {} },
});
(__VLS_ctx.isEdit ? "Editar subtarea" : "Nueva subtarea");
// @ts-ignore
[isEdit,];
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.onCancel) },
    ...{ class: "btn btn-outline" },
    ...{ style: {} },
});
// @ts-ignore
[onCancel,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "form-label" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.taskTitle);
// @ts-ignore
[taskTitle,];
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
    placeholder: "Nombre de la subtarea",
});
// @ts-ignore
[title,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.input)({
    type: "date",
    ...{ class: "input" },
});
(__VLS_ctx.dueDate);
// @ts-ignore
[dueDate,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.input)({
    type: "url",
    ...{ class: "input" },
    placeholder: "https://...",
});
(__VLS_ctx.link);
// @ts-ignore
[link,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
    value: (__VLS_ctx.description),
    rows: "2",
    ...{ style: {} },
});
// @ts-ignore
[description,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-footer" },
});
if (__VLS_ctx.isEdit) {
    // @ts-ignore
    [isEdit,];
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.onDelete) },
        ...{ class: "icon-btn icon-btn-danger" },
        ...{ style: {} },
        title: "Borrar tarea",
    });
    // @ts-ignore
    [onDelete,];
    __VLS_asFunctionalElement(__VLS_intrinsics.img)({
        src: "/deleteIcon.svg",
        alt: "Borrar tarea",
        ...{ class: "task-card-icon" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.onCancel) },
    ...{ class: "btn btn-outline" },
    ...{ style: {} },
});
// @ts-ignore
[onCancel,];
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.onSubmit) },
    ...{ class: "btn btn-primary" },
    ...{ style: {} },
});
// @ts-ignore
[onSubmit,];
(__VLS_ctx.isEdit ? "Guardar" : "Añadir subtarea");
// @ts-ignore
[isEdit,];
/** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
