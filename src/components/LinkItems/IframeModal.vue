<template>
  <div v-if="isOpen" class="vm--overlay modal-overlay" @click.self="hide">
    <div class="dashy-modal modal-box">
      <div class="top-right" @click="hide()">Close</div>
      <a @click="hide()" class="close-button" title="Close">x</a>
      <iframe
        v-if="url"
        :src="url"
        @keydown.esc="close"
        class="frame"
        allow="fullscreen; clipboard-write"
      />
      <div v-else class="no-url">No URL Specified</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAppStore } from "@/store/modules/appStore";

defineProps({
  name: String,
});

const emit = defineEmits(["closed"]);

const appStore = useAppStore();

const isOpen = ref(false);
const url = ref("#");

function show(newUrl: string) {
  url.value = newUrl;
  isOpen.value = true;
  appStore.setModalOpen(true);
}
function hide() {
  isOpen.value = false;
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
  position: relative;
  width: 80%;
  height: 80%;
  overflow: auto;

  .top-right {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.5rem;
    z-index: 1;
    cursor: pointer;
    background: var(--primary);
    color: var(--background);
    border-radius: 0 0 0 10px;
    border-left: 1px solid var(--primary);
    border-bottom: 1px solid var(--primary);
    &:hover {
      background: var(--background);
      color: var(--primary);
    }
  }
}

.frame {
  width: 100%;
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

.close-button {
  position: absolute;
  right: 0;
  padding: 0.5rem;
  border: 0;
  border-radius: 0 0 0 10px;
  background: var(--primary);
  color: var(--background);
  border-left: 1px solid var(--primary);
  border-bottom: 1px solid var(--primary);
  cursor: pointer;
  &:hover {
    background: var(--background);
    color: var(--primary);
  }
}
</style>
