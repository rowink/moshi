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

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import PageTitle from '@/components/PageStrcture/PageTitle.vue';
import Nav from '@/components/PageStrcture/Nav.vue';
import { shouldBeVisible } from '@/utils/SectionHelpers';
import { useAppStore } from '@/store';

export default defineComponent({
  name: 'Header',
  components: {
    PageTitle,
    Nav,
  },
  props: {
    pageInfo: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
  },
  computed: {
    appStore() { return useAppStore(); },
    componentVisible() {
      return shouldBeVisible(this.$route.name);
    },
    visibleComponents() {
      return this.appStore.visibleComponents;
    },
    titleVisible() {
      return this.visibleComponents.pageTitle;
    },
    navVisible() {
      return this.visibleComponents.navigation;
    },
  },
});
</script>

<style scoped lang="scss">

@use '@/styles/media-queries' as *;

  header {
    margin: 0;
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    background: var(--background-darker);
    align-items: center;
    align-content: flex-start;
    @include phone {
      flex-direction: column-reverse;
    }
  }
</style>
