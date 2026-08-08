<template>
  <div class="sub-items-group" :style="`--sub-item-col-count: ${columnCount}`">
    <p v-if="title" class="sub-item-group-title">{{ title }}</p>
    <SubItem
      v-for="(subItem, subIndex) in subItems"
      :key="subIndex"
      :id="`${itemId}-sub-${subIndex}`"
      :item="subItem"
      @triggerModal="triggerModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import SubItem from "@/components/LinkItems/SubItem.vue";
import { SubItem as SubItemType } from "@/types/types";

const props = defineProps({
  itemId: String,
  subItems: {
    type: Array as PropType<SubItemType[]>,
    default: () => [],
  },
  title: String,
  subItemGridSize: Number,
});

const emit = defineEmits(["triggerModal"]);

/* Determine number of columns to split items into, depending on number of items */
const columnCount = computed(() => {
  if (props.subItemGridSize) return props.subItemGridSize;
  const numItems = props.subItems.length;
  if (numItems >= 10) return 4;
  if (numItems >= 5) return 3;
  if (numItems >= 2) return 2;
  if (numItems === 1) return 1;
  return 2;
});

/* Pass open modal emit event up */
function triggerModal(url: string) {
  emit("triggerModal", url);
}
</script>

<style scoped lang="scss">
.sub-items-group {
  display: grid;
  margin: 0.5rem;
  padding: 0.1rem;
  flex-grow: 1;
  flex-basis: 6rem;
  grid-template-columns: repeat(var(--sub-item-col-count, 3), minmax(0, 1fr));
  color: var(--item-text-color);
  border: 1px solid var(--outline-color);
  border-radius: var(--curve-factor);
  text-decoration: none;
  transition: all 0.2s ease-in-out 0s;
  p.sub-item-group-title {
    margin: 0 auto;
    cursor: default;
    grid-column-start: span var(--sub-item-col-count, 3);
  }
}
</style>
