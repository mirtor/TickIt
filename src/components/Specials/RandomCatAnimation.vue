<template>
  <div class="lottie-box"><div ref="el" class="lottie-inner"></div></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import lottie from "lottie-web/build/player/lottie_svg";
import type { AnimationItem } from "lottie-web";
import { catAnimations } from "@/animations/cats/catalog";

const props = defineProps<{ loop?: boolean; autoplay?: boolean }>();

const el = ref<HTMLElement | null>(null);
let anim: AnimationItem | null = null;

function pickIndex(): number {
  if (!catAnimations.length) return 0;
  return Math.floor(Math.random() * catAnimations.length); // random cada mount
}

function onVisibility() {
  if (!anim) return;
  if (document.visibilityState === "visible") {
    // por si quedó “congelada”
    anim.play();
  } else {
    anim.pause();
  }
}

onMounted(async () => {
  if (!el.value) return;
  if (!catAnimations.length) {
    console.error("[RandomCatAnimation] No hay animaciones en catalog.");
    return;
  }

  const idx = pickIndex();
  const data = await catAnimations[idx].load();

  await nextTick(); // asegura container ya en layout

    anim = lottie.loadAnimation({
    container: el.value,
    renderer: "svg",
    loop: props.loop ?? true,
    autoplay: false,
    animationData: data,
    rendererSettings: { preserveAspectRatio: "xMidYMid meet" }
    });

    // Reinicio explícito al completar (por si el JSON viene con loop=false o se “clava”)
    anim.addEventListener("complete", () => {
    if (!anim) return;
    anim.goToAndPlay(0, true);
    });

  anim.setSpeed(1);

  // Arranque “a prueba de freezes”
    const start = () => {
        if (!anim) return;
        anim.stop();
        anim.play();
    };

  anim.addEventListener("DOMLoaded", start);
  anim.addEventListener("data_ready", start);

  // fallback por si esos eventos no saltan como esperas
  window.setTimeout(start, 50);

  document.addEventListener("visibilitychange", onVisibility);
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", onVisibility);
  anim?.destroy();
  anim = null;
});
</script>

<style scoped>


/* Alto disponible (elige: 100% del contenedor, o 100vh, o clamp) */
.lottie-box {
  height: 160px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* El player se ajusta al alto; el ancho se calcula solo */
.lottie-inner {
  height: 100%;
  width: auto;
  aspect-ratio: 1 / 1; /* opcional: si la mayoría son cuadradas */
  max-width: 100%;
}
.lottie-inner svg {
  height: 100%;
  width: auto;
  display: block;
}
</style>
