<template>
  <transition name="slide">
    <div
      class="context-menu"
      v-if="show && !isMenuDisabled"
      :style="posX && posY ? `top:${posY}px;left:${posX}px;` : ''"
    >
      <!-- Open Options -->
      <ul class="menu-section">
        <li class="section-title">
          {{ $t("context-menus.item.open-section-title") }}
        </li>
        <li @click="launch('sametab')">
          <SameTabOpenIcon />
          <span>{{ $t("context-menus.item.sametab") }}</span>
        </li>
        <li @click="launch('newtab')">
          <NewTabOpenIcon />
          <span>{{ $t("context-menus.item.newtab") }}</span>
        </li>
        <li @click="launch('modal')">
          <IframeOpenIcon />
          <span>{{ $t("context-menus.item.modal") }}</span>
        </li>
        <li @click="launch('workspace')">
          <WorkspaceOpenIcon />
          <span>{{ $t("context-menus.item.workspace") }}</span>
        </li>
        <li @click="launch('clipboard')">
          <ClipboardOpenIcon />
          <span>{{ $t("context-menus.item.clipboard") }}</span>
        </li>
      </ul>
    </div>
  </transition>
</template>

<script setup lang="ts">
// Import icons for each element
import SameTabOpenIcon from "@/assets/interface-icons/open-current-tab.svg";
import NewTabOpenIcon from "@/assets/interface-icons/open-new-tab.svg";
import IframeOpenIcon from "@/assets/interface-icons/open-iframe.svg";
import WorkspaceOpenIcon from "@/assets/interface-icons/open-workspace.svg";
import ClipboardOpenIcon from "@/assets/interface-icons/open-clipboard.svg";
import { useAppStore } from "@/store/modules/appStore";
import { computed } from "vue";

defineProps({
  posX: Number, // The X coordinate for positioning
  posY: Number, // The Y coordinate for positioning
  show: Boolean, // Should show or hide the menu
});
const emit = defineEmits(["launchItem"]);

const appStore = useAppStore();
const isMenuDisabled = computed(() => !!appStore.appConfig.disableContextMenu);

/* Called on item click, emits an event up to Item */
/* in order to launch the current app to a given target */
function launch(target: string) {
  emit("launchItem", target);
}
</script>

<style lang="scss">
div.context-menu {
  position: absolute;
  margin: 0;
  padding: 0;
  z-index: 8;
  background: var(--context-menu-background);
  color: var(--context-menu-color);
  border: 1px solid var(--context-menu-secondary-color);
  border-radius: var(--curve-factor);
  box-shadow: var(--context-menu-shadow);
  opacity: 0.98;

  ul.menu-section {
    list-style-type: none;
    margin: 0;
    padding: 0;
    &:not(:last-child) {
      border-bottom: 1px solid var(--context-menu-color);
    }
    li {
      cursor: pointer;
      padding: 0.5rem 1rem;
      display: flex;
      flex-direction: row;
      font-size: 1rem;
      &:not(:last-child) {
        border-bottom: 1px solid var(--context-menu-secondary-color);
      }
      &:hover:not(.section-title) {
        background: var(--context-menu-secondary-color);
      }
      &.section-title {
        cursor: default;
        font-weight: bold;
        justify-content: center;
      }
      svg {
        width: 1rem;
        margin-right: 0.5rem;
        path {
          fill: currentColor;
        }
      }
    }
    &.disabled li:not(.section-title) {
      cursor: not-allowed;
      opacity: var(--dimming-factor);
      &:hover {
        background: var(--context-menu-background);
      }
    }
  }
}

// Define enter and leave transitions
.slide-enter-active {
  animation: slide-in 0.1s;
}
.slide-leave-active {
  animation: slide-in 0.1s reverse;
}
@keyframes slide-in {
  0% {
    transform: scaleY(0.5) scaleX(0.8) translateY(-50px);
  }
  100% {
    transform: scaleY(1) translateY(0) translateY(0);
  }
}
</style>
