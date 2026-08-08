<template>
  <div
    @click="selectSection(index)" v-tooltip="tooltip()"
    v-bind:class="{ selected: selected, 'minimal-section-heading': true, center: hideTitleText }">
    <Icon v-if="icon" :icon="icon" size="small" class="section-icon" />
    <h3 class="section-title" v-if="!hideTitleText">{{ title }}</h3>
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/LinkItems/ItemIcon.vue';

const props = defineProps({
  index: Number,
  title: String,
  icon: String,
  selected: Boolean,
  hideTitleText: Boolean,
});

const emit = defineEmits(['sectionSelected']);

function selectSection(index: number | undefined) {
  emit('sectionSelected', index);
}
function tooltip() {
  return props.hideTitleText
    ? { content: props.title, trigger: 'hover focus', delay: 250 } : null;
}
</script>

<style scoped lang="scss">
@use '@/styles/media-queries' as *;
@use '@/styles/style-helpers' as *;

div.minimal-section-heading {
  display: flex;
  cursor: pointer;
  margin-bottom: 0;
  padding: 0.5rem 0.25rem;
  justify-content: flex-start;
  align-items: center;
  background: var(--minimal-view-section-heading-background);
  border: 1px solid var(--minimal-view-section-heading-color);
  border-bottom: none;
  border-radius: var(--curve-factor) var(--curve-factor) 0 0;
  h3.section-title {
    margin: 0;
    color: var(--minimal-view-section-heading-color);
  }
  .section-icon {
    color: var(--minimal-view-section-heading-color);
    margin-right: 0.2rem;
  }
  &.selected {
    background: var(--minimal-view-section-heading-color);
    h3.section-title, .section-icon {
      color: var(--minimal-view-section-heading-background);
    }
  }
  &.center {
    justify-content: center;
  }
}

</style>
