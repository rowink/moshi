<template>
  <div class="sub-side-bar">
    <div v-for="(item, index) in items" :key="index">
      <SideBarItem
        v-if="!item.subItems"
        class="item"
        :icon="item.icon"
        :title="item.title"
        :url="item.url"
        :target="item.target"
        @launch-app="launchApp"
      />
      <div v-if="item.subItems" class="sub-item-group">
        <SideBarItem
          v-for="(subItem, subIndex) in item.subItems"
          :key="subIndex"
          class="item sub-item"
          :icon="subItem.icon"
          :title="subItem.title"
          :url="subItem.url"
          :target="subItem.target"
          @launch-app="launchApp"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import SideBarItem from '@/components/Workspace/SideBarItem.vue';
import { Item as ItemType } from '@/types';

export default defineComponent({
  name: 'SideBarSection',
  props: {
    items: {
      type: Array as PropType<ItemType[]>,
      default: () => [],
    },
  },
  components: {
    SideBarItem,
  },
  methods: {
    launchApp(options: Record<string, any>) {
      this.$emit('launch-app', options);
    },
  },
});
</script>

<style lang="scss" scoped>
@use '@/styles/media-queries' as *;
@use '@/styles/style-helpers' as *;

div.sub-side-bar {
  display: flex;
  flex-direction: column;
  background: var(--side-bar-background-lighter);
  border-radius: var(--curve-factor);
  margin: 0.2rem;
  color: var(--side-bar-color);
  text-align: center;
  z-index: 3;
  .sub-item-group {
    border: 1px dotted var(--side-bar-color);
    border-radius: 4px;
    background: #00000033;
  }
}

</style>
