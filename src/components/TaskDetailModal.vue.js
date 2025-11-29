import { computed } from "vue";
const props = defineProps();
const emit = defineEmits();
const activeSubtasks = computed(() => props.task.subtasks?.filter((s) => !s.done) ?? []);
const completedSubtasks = computed(() => props.task.subtasks?.filter((s) => s.done) ?? []);
function onClose() {
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
    ...{ onClick: (__VLS_ctx.onClose) },
    ...{ class: "modal-backdrop" },
});
// @ts-ignore
[onClose,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-title" },
    ...{ style: {} },
});
(__VLS_ctx.task.title);
// @ts-ignore
[task,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "task-toolbar-counts" },
});
(__VLS_ctx.activeSubtasks.length);
(__VLS_ctx.completedSubtasks.length);
// @ts-ignore
[activeSubtasks, completedSubtasks,];
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.onClose) },
    ...{ class: "btn btn-outline" },
    ...{ style: {} },
});
// @ts-ignore
[onClose,];
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modal-body" },
});
if (__VLS_ctx.activeSubtasks.length) {
    // @ts-ignore
    [activeSubtasks,];
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "subtasks-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.hr)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "subtasks-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "subtasks-list" },
    });
    for (const [st] of __VLS_getVForSourceType((__VLS_ctx.activeSubtasks))) {
        // @ts-ignore
        [activeSubtasks,];
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (st.id),
            ...{ class: "subtask-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.input)({
            ...{ onChange: (...[$event]) => {
                    if (!(__VLS_ctx.activeSubtasks.length))
                        return;
                    __VLS_ctx.emit('toggle-subtask', st.id);
                    // @ts-ignore
                    [emit,];
                } },
            ...{ class: "subtask-checkbox" },
            type: "checkbox",
            checked: (st.done),
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "subtask-main" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "subtask-title" },
        });
        (st.title);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "subtask-meta" },
        });
        if (st.dueDate) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "subtask-date" },
            });
            (st.dueDate);
        }
        if (st.dueDate && st.link) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
        if (st.link) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                ...{ class: "subtask-link" },
                href: (st.link),
                target: "_blank",
                rel: "noopener noreferrer",
            });
        }
        if (st.description) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            if (st.dueDate || st.link) {
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            }
            (st.description);
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "subtask-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeSubtasks.length))
                        return;
                    __VLS_ctx.emit('edit-subtask', st.id);
                    // @ts-ignore
                    [emit,];
                } },
            ...{ class: "icon-btn" },
            title: "Editar subtarea",
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.img)({
            src: "/editIcon.svg",
            alt: "Editar",
            ...{ class: "task-card-icon" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('open-new-subtask');
            // @ts-ignore
            [emit,];
        } },
    ...{ class: "btn btn-primary" },
    title: "Añadir subtarea",
});
if (__VLS_ctx.completedSubtasks.length) {
    // @ts-ignore
    [completedSubtasks,];
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "subtasks-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.hr)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "subtasks-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "subtasks-list" },
    });
    for (const [st] of __VLS_getVForSourceType((__VLS_ctx.completedSubtasks))) {
        // @ts-ignore
        [completedSubtasks,];
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (st.id),
            ...{ class: "subtask-row subtask-row--completed" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.input)({
            ...{ onChange: (...[$event]) => {
                    if (!(__VLS_ctx.completedSubtasks.length))
                        return;
                    __VLS_ctx.emit('toggle-subtask', st.id);
                    // @ts-ignore
                    [emit,];
                } },
            ...{ class: "subtask-checkbox" },
            type: "checkbox",
            checked: (st.done),
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "subtask-main" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "subtask-title subtask-title--completed" },
        });
        (st.title);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "subtask-meta" },
        });
        if (st.dueDate) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "subtask-date" },
            });
            (st.dueDate);
        }
        if (st.dueDate && st.link) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
        if (st.link) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                ...{ class: "subtask-link" },
                href: (st.link),
                target: "_blank",
                rel: "noopener noreferrer",
            });
        }
        if (st.description) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            if (st.dueDate || st.link) {
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            }
            (st.description);
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "subtask-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.completedSubtasks.length))
                        return;
                    __VLS_ctx.emit('edit-subtask', st.id);
                    // @ts-ignore
                    [emit,];
                } },
            ...{ class: "icon-btn" },
            title: "Editar subtarea",
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.img)({
            src: "/editIcon.svg",
            alt: "Editar",
            ...{ class: "task-card-icon" },
        });
    }
}
if (__VLS_ctx.task.subtasks && __VLS_ctx.task.subtasks.length) {
    // @ts-ignore
    [task, task,];
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.task.subtasks && __VLS_ctx.task.subtasks.length))
                    return;
                __VLS_ctx.emit('uncheck-all');
                // @ts-ignore
                [emit,];
            } },
        ...{ class: "btn btn-outline btn-full" },
        ...{ style: {} },
    });
}
/** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['task-toolbar-counts']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['subtasks-section']} */ ;
/** @type {__VLS_StyleScopedClasses['subtasks-title']} */ ;
/** @type {__VLS_StyleScopedClasses['subtasks-list']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-row']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-main']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-title']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-date']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-link']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['subtasks-section']} */ ;
/** @type {__VLS_StyleScopedClasses['subtasks-title']} */ ;
/** @type {__VLS_StyleScopedClasses['subtasks-list']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-row']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-row--completed']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-main']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-title']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-title--completed']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-date']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-link']} */ ;
/** @type {__VLS_StyleScopedClasses['subtask-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-full']} */ ;
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
