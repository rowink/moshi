<template>
  <div>
    <span class="options-label">{{ $t("settings.layout-label") }}</span>
    <div class="display-options">
      <IconDeafault
        @click="updateDisplayLayout('auto')"
        v-tooltip="tooltip($t('settings.layout-auto'))"
        :class="`layout-icon ${displayLayout === 'auto' ? 'selected' : ''}`"
        tabindex="-2"
      />
      <IconHorizontal
        @click="updateDisplayLayout('horizontal')"
        v-tooltip="tooltip($t('settings.layout-horizontal'))"
        :class="`layout-icon ${displayLayout === 'horizontal' ? 'selected' : ''}`"
        tabindex="-2"
      />
      <IconVertical
        @click="updateDisplayLayout('vertical')"
        v-tooltip="tooltip($t('settings.layout-vertical'))"
        :class="`layout-icon ${displayLayout === 'vertical' ? 'selected' : ''}`"
        tabindex="-2"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconDeafault from "@/assets/interface-icons/layout-default.svg";
import IconHorizontal from "@/assets/interface-icons/layout-horizontal.svg";
import IconVertical from "@/assets/interface-icons/layout-vertical.svg";
import { useAppStore } from "@/store/modules/appStore";

defineProps({
  displayLayout: String,
});

const appStore = useAppStore();

function updateDisplayLayout(layout: string) {
  appStore.setItemLayout(layout);
}
function tooltip(content: string) {
  return { content, triggers: ["hover", "focus"], delay: 250 };
}
</script>

<style scoped lang="scss">
span.options-label {
  color: var(--settings-text-color);
}

.display-options {
  color: var(--settings-text-color);
  svg {
    :deep(path) {
      fill: var(--settings-text-color);
    }
    width: 1rem;
    height: 1rem;
    margin: 0.2rem;
    padding: 0.2rem;
    text-align: center;
    background: var(--background);
    border: 1px solid currentColor;
    border-radius: var(--curve-factor);
    cursor: pointer;
    &:hover,
    &.selected {
      background: var(--settings-text-color);
      :deep(path) {
        fill: var(--background);
      }
    }
  }
}
</style>
