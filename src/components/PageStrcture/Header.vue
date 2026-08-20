<template>
  <header v-if="componentVisible">
    <PageTitle
      v-if="titleVisible"
      :title="pageInfo.title"
      :description="pageInfo.description"
      :logo="pageInfo.logo"
    />
    <Nav v-if="navVisible" :links="pageInfo.navLinks" class="nav" />
  </header>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { useRoute } from "vue-router";
import PageTitle from "@/components/PageStrcture/PageTitle.vue";
import Nav from "@/components/PageStrcture/Nav.vue";
import { shouldBeVisible } from "@/utils/SectionHelpers";
import { useAppStore } from "@/store/modules/appStore";

defineProps({
  pageInfo: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
});

const route = useRoute();
const appStore = useAppStore();

const componentVisible = computed(() => shouldBeVisible(route.name as string));
const visibleComponents = computed(() => appStore.visibleComponents);
const titleVisible = computed(() => visibleComponents.value.pageTitle);
const navVisible = computed(() => visibleComponents.value.navigation);
</script>

<style scoped lang="scss">
@use "@/styles/media-queries" as *;

header {
  margin: 0;
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  background: var(--background-darker);
  align-items: center;
  align-content: flex-start;
  @include phone {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 0.4rem 0.75rem;
  }
}
</style>
