<template>
  <Collapsable
    :title="title"
    :icon="icon"
    :uniqueKey="groupId"
    :collapsed="displayData.collapsed"
    :cols="displayData.cols"
    :rows="displayData.rows"
    :color="displayData.color"
    :customStyles="displayData.customStyles"
    :cutToHeight="displayData.cutToHeight"
    @openContextMenu="openContextMenu"
    :id="sectionRef"
    :ref="setCollapsableRef"
  >
    <!-- If no items, show message -->
    <div v-if="isEmpty" class="no-items">
      {{ $t("home.no-items-section") }}
    </div>
    <!-- Item Container -->
    <div
      v-if="hasItems"
      :class="`there-are-items ${isGridLayout ? 'item-group-grid' : ''} inner-size-${itemSize}`"
      :style="gridStyle"
      :id="`section-${groupId}`"
    >
      <!-- Show for each item -->
      <template v-for="item in sortedItems" :key="item.id">
        <SubItemGroup
          v-if="item.subItems"
          :itemId="item.id"
          :title="item.title"
          :subItems="item.subItems"
          @triggerModal="triggerModal"
        />
        <Item
          v-else
          :item="item"
          :itemSize="itemSize"
          :parentSectionTitle="title"
          @itemClicked="emit('itemClicked')"
          @triggerModal="triggerModal"
          :isAddNew="false"
          :sectionWidth="sectionWidth"
          :sectionDisplayData="displayData"
        />
      </template>
    </div>
    <!-- Modal for opening in modal view -->
    <IframeModal
      :ref="setIframeModalRef"
      :name="`iframeModal-${groupId}`"
      @closed="emit('itemClicked')"
    />
    <!-- Right-click item options context menu -->
    <ContextMenu
      :show="contextMenuOpen"
      :posX="contextPos.posX"
      :posY="contextPos.posY"
      :id="`context-menu-${groupId}`"
      v-click-outside="closeContextMenu"
      @expandCollapseSection="expandCollapseSection"
    />
  </Collapsable>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  type PropType,
} from "vue";
import Item from "@/components/LinkItems/Item.vue";
import SubItemGroup from "@/components/LinkItems/SubItemGroup.vue";
import Collapsable from "@/components/LinkItems/Collapsable.vue";
import IframeModal from "@/components/LinkItems/IframeModal.vue";
import ContextMenu from "@/components/LinkItems/SectionContextMenu.vue";
import ErrorHandler from "@/utils/ErrorHandler";
import {
  sortOrder as defaultSortOrder,
  localStorageKeys,
} from "@/utils/defaults";
import { useAppStore } from "@/store/modules/appStore";
import { Item as ItemType } from "@/types/types";

const props = defineProps({
  groupId: String,
  title: String,
  icon: String,
  displayData: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  items: { type: Array as PropType<ItemType[]>, default: () => [] },
  index: Number,
  searchTerm: String,
});
const emit = defineEmits(["itemClicked"]);

const appStore = useAppStore();
const appConfig = computed(() => appStore.appConfig);

const contextMenuOpen = ref(false);
const contextPos = reactive({
  posX: undefined as number | undefined,
  posY: undefined as number | undefined,
});
const sectionWidth = ref(0);
const resizeObserver = ref<ResizeObserver | undefined>(undefined);

/* Template refs */
const collapsableRef = ref<InstanceType<typeof Collapsable> | null>(null);
const iframeModals = ref<Record<string, InstanceType<typeof IframeModal> | null>>({});

const setCollapsableRef = (el: unknown) => {
  collapsableRef.value = el as InstanceType<typeof Collapsable> | null;
};
const setIframeModalRef = (el: unknown) => {
  iframeModals.value[`iframeModal-${props.groupId}`] = el as InstanceType<
    typeof IframeModal
  > | null;
};

const itemSize = computed(
  () => props.displayData.itemSize || appStore.iconSize,
);
const sortOrder = computed(() => props.displayData.sortBy || defaultSortOrder);
const hasItems = computed(() => props.items && props.items.length > 0);
const isEmpty = computed(() => !hasItems.value);
const sectionRef = computed(() => `section-outer-${props.groupId}`);
/* If the sortBy attribute is specified, then return sorted data */
const sortedItems = computed(() => {
  const items = [...props.items];
  if (appConfig.value.disableSmartSort) return items;
  if (sortOrder.value === "alphabetical") {
    return sortAlphabetically(items);
  } else if (sortOrder.value === "reverse-alphabetical") {
    return sortAlphabetically(items).reverse();
  } else if (sortOrder.value === "most-used") {
    return sortByMostUsed(items);
  } else if (sortOrder.value === "last-used") {
    return sortByLastUsed(items);
  } else if (sortOrder.value === "random") {
    return sortRandomly(items);
  } else if (sortOrder.value && sortOrder.value !== "default") {
    ErrorHandler(
      `Unknown Sort order '${sortOrder.value}' under '${props.title}'`,
    );
  }
  return items;
});
const isGridLayout = computed(
  () =>
    props.displayData.sectionLayout === "grid" ||
    !!(props.displayData.itemCountX || props.displayData.itemCountY),
);
const gridStyle = computed(() => {
  let styles = "";
  if (document.body.clientWidth > 600) {
    // Only proceed if not on tiny screen
    styles += props.displayData.itemCountX
      ? `grid-template-columns: repeat(${props.displayData.itemCountX}, minmax(0, 1fr));`
      : "";
    styles += props.displayData.itemCountY
      ? `grid-template-rows: repeat(${props.displayData.itemCountY}, minmax(0, 1fr));`
      : "";
  }
  return styles;
});

/* Opens the iframe modal */
function triggerModal(url: string) {
  iframeModals.value[`iframeModal-${props.groupId}`]?.show(url);
}
/* Sorts items alphabetically using the title attribute */
function sortAlphabetically(items: ItemType[]) {
  return items.sort((a, b) =>
    (a.title || "").toLowerCase() > (b.title || "").toLowerCase() ? 1 : -1,
  );
}
/* Sorts items by most used to least used, based on click-count */
function sortByMostUsed(items: ItemType[]) {
  const usageCount = JSON.parse(
    localStorage.getItem(localStorageKeys.MOST_USED) || "{}",
  );
  const gmu = (item: ItemType) => usageCount[item.id || ""] || 0;
  items.reverse().sort((a, b) => (gmu(a) < gmu(b) ? 1 : -1));
  return items;
}
/* Sorts items by most recently used */
function sortByLastUsed(items: ItemType[]) {
  const usageCount = JSON.parse(
    localStorage.getItem(localStorageKeys.LAST_USED) || "{}",
  );
  const glu = (item: ItemType) => usageCount[item.id || ""] || 0;
  items.reverse().sort((a, b) => (glu(a) < glu(b) ? 1 : -1));
  return items;
}
/* Sorts items randomly */
function sortRandomly(items: ItemType[]) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
/* Toggle sections collapse state */
function expandCollapseSection() {
  if (collapsableRef.value) collapsableRef.value.toggle();
  closeContextMenu();
}
/* Open custom context menu, and set position */
function openContextMenu(e: MouseEvent) {
  contextMenuOpen.value = true; // Open context menu
  // If mouse position not set, use section coordinates
  const sectionOuterId = `section-outer-${props.groupId}`;
  const sectionPosition = document
    .getElementById(sectionOuterId)!
    .getBoundingClientRect();
  contextPos.posX =
    (e.clientX || sectionPosition.right - 10) + window.pageXOffset;
  contextPos.posY =
    (e.clientY || sectionPosition.top + 30) + window.pageYOffset;
}
/* Hide the right-click context menu */
function closeContextMenu() {
  contextMenuOpen.value = false;
}
/* Calculate width of section, used to dynamically set number of columns */
function calculateSectionWidth() {
  const secElem = collapsableRef.value;
  if (secElem && secElem.$el.clientWidth)
    sectionWidth.value = secElem.$el.clientWidth;
}

onMounted(() => {
  // Set the section width, and recalculate when section resized
  if (collapsableRef.value) {
    resizeObserver.value = new ResizeObserver(calculateSectionWidth);
    resizeObserver.value.observe(collapsableRef.value.$el);
  }
});
onBeforeUnmount(() => {
  // If resize observer set, and element still present, then de-register
  if (resizeObserver.value && collapsableRef.value) {
    resizeObserver.value.unobserve(collapsableRef.value.$el);
  }
});
</script>

<style scoped lang="scss">
@use "@/styles/media-queries" as *;
@use "@/styles/style-helpers" as *;

.no-items {
  width: 100px;
  margin: 0 auto;
  padding: 0.8rem;
  text-align: center;
  cursor: default;
  color: var(--primary);
  background: var(--item-background);
  border-radius: var(--curve-factor);
  box-shadow: var(--item-shadow);
}

.there-are-items {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  &.item-group-grid {
    display: grid;
    overflow: auto;
    @extend .scroll-bar;
    @include phone {
      --item-col-count: 1;
    }
    @include tablet {
      --item-col-count: 2;
    }
    @include laptop {
      --item-col-count: 2;
    }
    @include monitor {
      --item-col-count: 3;
    }
    @include big-screen {
      --item-col-count: 4;
    }
    @include big-screen-up {
      --item-col-count: 5;
    }
    grid-template-columns: repeat(var(--item-col-count, 2), minmax(0, 1fr));
  }
}
.orientation-horizontal {
  display: flex;
  flex-direction: column;
  .there-are-items {
    display: grid;
    @include phone {
      --item-col-count: 2;
    }
    @include tablet {
      --item-col-count: 4;
    }
    @include laptop {
      --item-col-count: 6;
    }
    @include monitor {
      --item-col-count: 8;
    }
    @include big-screen {
      --item-col-count: 10;
    }
    @include big-screen-up {
      --item-col-count: 12;
    }
    grid-template-columns: repeat(var(--item-col-count, 2), minmax(0, 1fr));
  }
  .there-are-items.inner-size-large {
    display: grid;
    @include phone {
      --item-col-count: 1;
    }
    @include tablet {
      --item-col-count: 2;
    }
    @include laptop {
      --item-col-count: 3;
    }
    @include monitor {
      --item-col-count: 5;
    }
    @include big-screen {
      --item-col-count: 6;
    }
    @include big-screen-up {
      --item-col-count: 8;
    }
    grid-template-columns: repeat(var(--item-col-count, 2), minmax(0, 1fr));
  }
}
</style>
