<template>
  <div @click="itemClicked()"
    :class="`side-bar-item ${icon ? 'w-icon' : 'text-only'}`" v-tooltip="tooltip">
    <Icon v-if="icon" :icon="icon" size="small" :url="url" />
    <p class="small-title" v-else>{{ title }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Icon from "@/components/LinkItems/ItemIcon.vue";

const props = defineProps({
  icon: String,
  title: String,
  url: String,
  target: String,
  click: Function,
});

const emit = defineEmits(["launch-app"]);

function itemClicked() {
  if (props.url) emit("launch-app", { url: props.url, target: props.target });
}

const tooltip = computed(() => ({
  disabled: !props.title,
  content: props.title,
  trigger: "hover focus",
  placement: "bottom-end",
}));
</script>

<style lang="scss" scoped>

div.side-bar-item {
  color: var(--side-bar-item-color);
  background: var(--side-bar-item-background);
  text-align: center;
  &.text-only {
    background: none;
    border: none;
    box-shadow: none;
    p.small-title {
      margin: 0.1rem 0 0 -0.5rem;
      font-size: 0.6rem;
      transform: rotate(-25deg);
      padding: 0.5rem 0;
    }
  }
}
</style>
