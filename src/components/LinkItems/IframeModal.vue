<template>
  <div v-if="isOpen" class="vm--overlay modal-overlay" @click.self="hide">
    <div
      ref="modalBoxRef"
      class="dashy-modal modal-box"
      :style="{
        width: modalWidth,
        height: modalHeight,
        left: modalLeft,
        top: modalTop,
      }"
    >
      <div class="modal-actions">
        <button
          type="button"
          class="action-button"
          :title="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
          @click="toggleFullscreen"
        >
          <Minimize v-if="isFullscreen" :size="16" />
          <Maximize v-else :size="16" />
        </button>
        <button type="button" class="action-button" title="Close" @click="hide()">
          <X :size="16" />
        </button>
      </div>

      <div class="frame-wrapper">
        <iframe
          v-if="url"
          :src="url"
          @keydown.esc="close"
          class="frame"
          allow="fullscreen; clipboard-write"
        />
        <div v-else class="no-url">No URL Specified</div>
      </div>

      <!-- Drag-resize handles on every edge and corner -->
      <div class="resize-handle resize-n" @pointerdown="startResize('n', $event)" />
      <div class="resize-handle resize-s" @pointerdown="startResize('s', $event)" />
      <div class="resize-handle resize-e" @pointerdown="startResize('e', $event)" />
      <div class="resize-handle resize-w" @pointerdown="startResize('w', $event)" />
      <div class="resize-handle resize-ne" @pointerdown="startResize('ne', $event)" />
      <div class="resize-handle resize-nw" @pointerdown="startResize('nw', $event)" />
      <div class="resize-handle resize-sw" @pointerdown="startResize('sw', $event)" />
      <div class="resize-handle resize-se" title="Resize" @pointerdown="startResize('se', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Maximize, Minimize, X } from "@lucide/vue";
import { useAppStore } from "@/store/modules/appStore";

defineProps({
  name: String,
});

const emit = defineEmits(["closed"]);

const appStore = useAppStore();

const isOpen = ref(false);
const url = ref("#");

/* Modal box geometry; starts at 80% x 80% centered (left/top auto),
   becomes pixel-based once dragged or maximized */
const modalWidth = ref("80%");
const modalHeight = ref("80%");
const modalLeft = ref("auto");
const modalTop = ref("auto");
const modalBoxRef = ref<HTMLDivElement | null>(null);

const MIN_WIDTH = 350;
const MIN_HEIGHT = 200;
const VIEWPORT_MARGIN = 24;

/* Number of currently open iframe modals, shared across instances */
let openModalCount = 0;

const isFullscreen = ref(false);
/* Geometry before entering fullscreen, restored on exit */
let prevGeometry: {
  width: string;
  height: string;
  left: string;
  top: string;
} | null = null;

function show(newUrl: string) {
  url.value = newUrl;
  isOpen.value = true;
  isFullscreen.value = false;
  prevGeometry = null;
  modalWidth.value = "80%";
  modalHeight.value = "80%";
  modalLeft.value = "auto";
  modalTop.value = "auto";
  lockPageScroll();
  appStore.setModalOpen(true);
}
function hide() {
  isOpen.value = false;
  unlockPageScroll();
  modalClosed();
  emit("closed");
}
function modalClosed() {
  appStore.setModalOpen(false);
}
/* Closes the modal, called on Esc key within iframe */
function close() {
  hide();
}

/* Prevent the host page from scrolling while the modal is open */
function lockPageScroll() {
  openModalCount += 1;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}
function unlockPageScroll() {
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }
}

/* Toggle between maximized (filling the viewport) and the previous size */
function toggleFullscreen() {
  if (isFullscreen.value) {
    if (prevGeometry) {
      modalWidth.value = prevGeometry.width;
      modalHeight.value = prevGeometry.height;
      modalLeft.value = prevGeometry.left;
      modalTop.value = prevGeometry.top;
    }
    isFullscreen.value = false;
  } else {
    prevGeometry = {
      width: modalWidth.value,
      height: modalHeight.value,
      left: modalLeft.value,
      top: modalTop.value,
    };
    modalWidth.value = `${window.innerWidth}px`;
    modalHeight.value = `${window.innerHeight}px`;
    modalLeft.value = "0px";
    modalTop.value = "0px";
    isFullscreen.value = true;
  }
}

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/* Drag-resize of the modal box from any edge or corner handle.
   Direction letters: n/s/e/w move that edge; combinations resize two edges */
function startResize(direction: ResizeDirection, event: PointerEvent) {
  const handle = event.currentTarget as HTMLElement;
  handle.setPointerCapture(event.pointerId);

  const rect = modalBoxRef.value?.getBoundingClientRect();
  if (!rect) return;
  /* Snap to explicit pixel position so edge/corner dragging works from any state */
  modalLeft.value = `${rect.left}px`;
  modalTop.value = `${rect.top}px`;
  modalWidth.value = `${rect.width}px`;
  modalHeight.value = `${rect.height}px`;

  const startX = event.clientX;
  const startY = event.clientY;
  const startLeft = rect.left;
  const startTop = rect.top;
  const startWidth = rect.width;
  const startHeight = rect.height;
  const maxWidth = window.innerWidth - VIEWPORT_MARGIN;
  const maxHeight = window.innerHeight - VIEWPORT_MARGIN;
  /* On small screens the fixed 350px minimum exceeds the viewport, which
     would lock the width; shrink the minimum to fit the screen instead */
  const minWidth = Math.min(MIN_WIDTH, Math.round(window.innerWidth * 0.5));
  const minLeft = Math.max(VIEWPORT_MARGIN, startLeft + startWidth - maxWidth);
  const minTop = Math.max(VIEWPORT_MARGIN, startTop + startHeight - maxHeight);
  const maxLeft = startLeft + startWidth - minWidth;
  const maxTop = startTop + startHeight - MIN_HEIGHT;

  const onMove = (moveEvent: PointerEvent) => {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;
    let left = startLeft;
    let top = startTop;
    let width = startWidth;
    let height = startHeight;

    if (direction.includes("e")) width = clamp(startWidth + dx, minWidth, maxWidth);
    if (direction.includes("s")) height = clamp(startHeight + dy, MIN_HEIGHT, maxHeight);
    if (direction.includes("w")) {
      left = clamp(startLeft + dx, minLeft, maxLeft);
      width = startLeft + startWidth - left;
    }
    if (direction.includes("n")) {
      top = clamp(startTop + dy, minTop, maxTop);
      height = startTop + startHeight - top;
    }

    modalLeft.value = `${left}px`;
    modalTop.value = `${top}px`;
    modalWidth.value = `${width}px`;
    modalHeight.value = `${height}px`;
  };
  const onEnd = () => {
    handle.removeEventListener("pointermove", onMove);
    handle.removeEventListener("pointerup", onEnd);
    handle.removeEventListener("pointercancel", onEnd);
  };

  handle.addEventListener("pointermove", onMove);
  handle.addEventListener("pointerup", onEnd);
  handle.addEventListener("pointercancel", onEnd);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

defineExpose({ show, hide, close });
</script>

<style lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  /* Absolute so left/top edges can be dragged; auto offsets keep it centered
     by the flex overlay until the first drag or maximize */
  position: absolute;
  overflow: visible;
  scrollbar-width: none;

  .modal-actions {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 3;
    display: flex;
    gap: 0.25rem;

    .action-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--primary);
      cursor: pointer;

      &:hover {
        opacity: 0.7;
      }
    }
  }
}

.frame-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.frame {
  /* Widen the frame so the embedded page's native scrollbar is clipped out of
     view by the wrapper, keeping the bottom-right corner clear for the handle */
  width: calc(100% + 24px);
  height: 100%;
  border: none;
}

.no-url {
  margin: 4rem auto;
  width: fit-content;
  font-size: 2rem;
  padding: 0.5rem;
  border: 1px dashed #ff0000;
  border-radius: 3px;
  background: #f4f2f2;
}

.resize-handle {
  position: absolute;
  z-index: 2;
  touch-action: none;
}

.resize-n {
  top: -3px;
  left: 8px;
  right: 8px;
  height: 6px;
  cursor: ns-resize;
}

.resize-s {
  bottom: -3px;
  left: 8px;
  right: 8px;
  height: 6px;
  cursor: ns-resize;
}

.resize-e {
  right: -3px;
  top: 8px;
  bottom: 8px;
  width: 6px;
  cursor: ew-resize;
}

.resize-w {
  left: -3px;
  top: 8px;
  bottom: 8px;
  width: 6px;
  cursor: ew-resize;
}

.resize-ne {
  top: -3px;
  right: -3px;
  width: 12px;
  height: 12px;
  cursor: nesw-resize;
}

.resize-nw {
  top: -3px;
  left: -3px;
  width: 12px;
  height: 12px;
  cursor: nwse-resize;
}

.resize-sw {
  bottom: -3px;
  left: -3px;
  width: 12px;
  height: 12px;
  cursor: nesw-resize;
}

.resize-se {
  right: 0;
  bottom: 0;
  width: 18px;
  height: 18px;
  cursor: nwse-resize;

  &::after {
    display: block;
    position: absolute;
    content: "";
    background: transparent;
    left: 5px;
    top: 5px;
    width: 0;
    height: 0;
    border-bottom: 10px solid #ddd;
    border-left: 10px solid transparent;
  }
}
</style>
