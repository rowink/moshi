<template>
  <div class="multi-taking-view">
    <WebContent
      v-for="app in openApps"
      :key="app"
      :url="app"
      :id="`wc-${btoaId(app)}`"
      :class="{ hide: app !== url }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import WebContent from '@/components/Workspace/WebContent.vue';

const props = defineProps({
  url: String, // The URL of currently visible app
});

const openApps = ref<string[]>([]); // List of all currently open apps

/* Encodes a URL for use as an element id */
const btoaId = (value: string) => btoa(value);

/* Adds the currently visible app to the list of open apps */
function launchApp() {
  if (!props.url) return;
  if (openApps.value.includes(props.url)) return; // Already open; visibility handled by class binding
  openApps.value.push(props.url);
}

watch(
  () => props.url,
  () => { launchApp(); },
);
</script>

<style lang="scss" scoped>

iframe {
  position: absolute;
  left: var(--side-bar-width);
  height: calc(100% - var(--header-height));
  width: calc(100% - var(--side-bar-width));
  border: none;
  background: white;
}

</style>
