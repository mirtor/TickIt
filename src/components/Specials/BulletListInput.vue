<template>
  <div class="bullet-editor">
    <ul class="bullet-list">
      <li
        v-for="(line, idx) in lines"
        :key="idx"
        class="bullet-item"
        :class="{ 'bullet-item--empty': idx > 0 && !line?.trim() }"
      >
        <textarea
          ref="inputs"
          class="bullet-input"
          rows="1"
          :placeholder="idx === 0 ? placeholder : ''"
          v-model="lines[idx]"
          @input="autoResize($event)"
          @keydown.enter.prevent="addLine(idx)"
          @keydown.backspace="maybeRemoveLine(idx, $event)"
          @paste="onPaste(idx, $event)"
        ></textarea>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch, onMounted } from "vue";

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();

const placeholder = props.placeholder ?? "Añade un punto...";

const lines = ref<string[]>([""]);
const inputs = ref<HTMLTextAreaElement[] | null>(null);

watch(
  () => props.modelValue,
  (v) => {
    const arr = (v ?? "").split("\n");
    lines.value = arr.length ? arr : [""];

    // importante: recalcular alturas tras cargar datos
    resizeAll();
  },
  { immediate: true }
);

watch(
  lines,
  (arr) => {
    const copy = [...arr];
    while (copy.length > 1 && copy[copy.length - 1] === "") {
      copy.pop();
    }
    emit("update:modelValue", copy.join("\n"));

    // importante: recalcular alturas
    resizeAll();
  },
  { deep: true }
);


async function focusLine(index: number) {
  await nextTick();
  const els = document.querySelectorAll<HTMLTextAreaElement>(".bullet-input");
  els[index]?.focus();
  autoResizeElement(els[index]);
}

function addLine(idx: number) {
  lines.value.splice(idx + 1, 0, "");
  focusLine(idx + 1);
}

function maybeRemoveLine(idx: number, e: KeyboardEvent) {
  if (lines.value.length === 1) return;
  if (lines.value[idx] !== "") return;

  e.preventDefault();
  lines.value.splice(idx, 1);
  focusLine(Math.max(0, idx - 1));
}

function onPaste(idx: number, e: ClipboardEvent) {
  const text = e.clipboardData?.getData("text");
  if (!text) return;

  const pastedLines = text.split(/\r?\n/);
  if (pastedLines.length <= 1) return;

  e.preventDefault();
  lines.value.splice(idx, 1, ...pastedLines);
  focusLine(idx + pastedLines.length - 1);
}

// ---- autosize ----
function autoResize(ev: Event) {
  const el = ev.target as HTMLTextAreaElement;
  autoResizeElement(el);
}

function autoResizeElement(el?: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function resizeAll() {
  nextTick(() => {
    const els = document.querySelectorAll<HTMLTextAreaElement>(".bullet-input");
    els.forEach((el) => autoResizeElement(el));
  });
}

onMounted(() => {
  resizeAll();
});

</script>

<style scoped>
.bullet-editor {
  border: 1px solid var(--border);
  background: #f9fafb;
  border-radius: 12px;
  padding: 0.5rem 0.6rem;
}

.bullet-list {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  list-style: none;
}

.bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
}

.bullet-item::before {
  content: "•";
  line-height: 1.2rem; 
  margin-top: 0.1rem; 
}

.bullet-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.8rem;
  color: inherit;
  line-height: 1.2rem;
  text-align: justify;

  resize: none;
  overflow: hidden;

  white-space: pre-wrap;
  word-break: break-word;
  box-sizing: border-box;
}

/* Cuando la línea está vacía, quitamos el punto */
.bullet-item--empty::before {
  content: "";
}

/* Y dibujamos una línea separadora sutil */
.bullet-item--empty {
  position: relative;
}

.bullet-item--empty::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: var(--primary);
  opacity: 0.4;
  pointer-events: none;
}

.bullet-item--empty .bullet-input {
  min-height: 0.9rem;
  opacity: 0.35;
}


</style>
