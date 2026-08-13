<template>
  <section class="layout-options">
    <LayoutSelector :displayLayout="displayLayout" />
    <IconSizeSelector :iconSize="iconSize" />
  </section>
</template>

<script setup lang="ts">
import LayoutSelector from "@/components/LayoutOptions/LayoutSelector.vue";
import IconSizeSelector from "@/components/LayoutOptions/IconSizeSelector.vue";
import { useAppStore } from "@/store/modules/appStore";
import { computed } from "vue";

const appStore = useAppStore();
/* Current layout orientation, from app config */
const displayLayout = computed(() => appStore.layout);
/* Current item size, from app config */
const iconSize = computed(() => appStore.iconSize);
</script>

<style scoped lang="scss">
.layout-options {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.25rem 0;
  position: relative;
}
</style>
