<template>
  <section class="layout-options" v-click-outside="closeViewSwitcher">
    <LayoutSelector :displayLayout="displayLayout" />
    <IconSizeSelector :iconSize="iconSize" />
    <IconViewMode
      @click="openChangeViewMenu()"
      v-tooltip="tooltip($t('alternate-views.alternate-view-heading'))"
      tabindex="-2"
      class="view-switch-button"
    />
    <ViewSwitcher v-if="viewSwitcherOpen" />
  </section>
</template>

<script lang="ts">
import LayoutSelector from '@/components/LayoutOptions/LayoutSelector.vue';
import IconSizeSelector from '@/components/LayoutOptions/IconSizeSelector.vue';
import ViewSwitcher from '@/components/LayoutOptions/ViewSwitcher.vue';
import IconViewMode from '@/assets/interface-icons/application-change-view.svg';
import { useAppStore } from '@/store';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LayoutOptions',
  components: {
    LayoutSelector,
    IconSizeSelector,
    ViewSwitcher,
    IconViewMode,
  },
  data: () => ({
    viewSwitcherOpen: false,
  }),
  computed: {
    appStore() { return useAppStore(); },
    /* Current layout orientation, from app config */
    displayLayout() { return this.appStore.layout; },
    /* Current item size, from app config */
    iconSize() { return this.appStore.iconSize; },
  },
  methods: {
    openChangeViewMenu() {
      this.viewSwitcherOpen = !this.viewSwitcherOpen;
    },
    closeViewSwitcher() {
      this.viewSwitcherOpen = false;
    },
    tooltip(content: string) {
      return { content, trigger: 'hover focus', delay: 250 };
    },
  },
});
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

  .view-switch-button {
    width: 1rem;
    height: 1rem;
    padding: 0.2rem;
    text-align: center;
    background: var(--background);
    border: 1px solid currentColor;
    border-radius: var(--curve-factor);
    cursor: pointer;
    path { fill: var(--settings-text-color); }
    &:hover {
      opacity: 0.7;
    }
  }
}

</style>
