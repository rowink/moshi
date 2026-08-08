<template ref="container">
  <div class="sub-item-wrapper">
    <a
      @click="itemClicked"
      @contextmenu.prevent
      @long-press="openContextMenu"
      @mouseup.right="openContextMenu"
      v-longPress="true"
      :href="hyperLinkHref"
      :target="anchorTarget"
      v-tooltip="subItemTooltip"
      rel="noopener noreferrer"
      tabindex="0"
      :id="`link-${id}`"
      class="sub-item-link item"
    >
      <!-- Item Icon -->
      <Icon
        :icon="item.icon"
        :url="item.url"
        size="small"
        v-bind:style="customStyles"
        class="sub-icon-img bounce"
      />
    </a>
    <!-- Right-click context menu -->
    <ContextMenu
      :show="contextMenuOpen && !isAddNew"
      v-click-outside="closeContextMenu"
      :posX="contextPos.posX"
      :posY="contextPos.posY"
      :id="`context-menu-${id}`"
      :disableEdit="true"
      @launchItem="launchItem"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import Icon from "@/components/LinkItems/ItemIcon.vue";
import ContextMenu from "@/components/LinkItems/ItemContextMenu.vue";
import useItem from "@/composables/useItem";
import { SubItem } from "@/types/types";
import vLongPress from "@/directives/LongPress";
// import { targetValidator } from '@/utils/ConfigHelpers';

const props = defineProps({
  id: String, // The unique ID of a tile (e.g. 001)
  item: { type: Object as PropType<SubItem>, default: (): SubItem => ({}) },
});

const emit = defineEmits(["itemClicked", "triggerModal"]);

const isAddNew = false; // Sub-items are never the 'fake' add-new tile

const {
  contextMenuOpen,
  contextPos,
  customStyles,
  anchorTarget,
  hyperLinkHref,
  itemClicked,
  launchItem,
  openContextMenu,
  closeContextMenu,
} = useItem(
  { item: props.item, isAddNew },
  emit as (event: string, ...args: unknown[]) => void,
);

const subItemTooltip = computed(() => props.item.title);
</script>

<style lang="scss">
.sub-item-wrapper {
  flex-grow: 1;
  flex-basis: 6rem;
  display: flex;
  a.sub-item-link {
    margin: 0.2rem;
    .sub-icon-img {
      margin: 0;
    }
  }
  &.wrap-size-large {
    flex-basis: 12rem;
  }
}
</style>
