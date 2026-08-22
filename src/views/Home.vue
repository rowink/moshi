<!-- Main homepage for default view -->
<template>
  <div class="home" :style="getBackgroundImage()">
    <!-- Search bar + layout options, on the same row -->
    <div class="home-toolbar">
      <SearchBar
        v-if="searchVisible"
        ref="filterComp"
        @user-is-searchin="searching"
      />
      <LayoutOptions />
    </div>
    <!-- Main content, section for each group of items -->
    <div
      v-if="checkTheresData(sections)"
      :class="
        `item-group-container ` +
        `orientation-${layout} ` +
        `item-size-${itemSizeBound} ` +
        (colCount ? `col-count-${colCount} ` : '')
      "
    >
      <template
        v-for="(section, index) in filteredTiles"
        :key="`${pageId}-${section.name || index}`"
      >
        <Section
          :title="section.name"
          :icon="section.icon || undefined"
          :displayData="getDisplayData(section)"
          :groupId="`${pageId}-section-${index}`"
          :items="filterTiles(section.items, searchValue)"
          :searchTerm="searchValue"
          :itemSize="itemSizeBound"
          @itemClicked="finishedSearching()"
          @change-modal-visibility="updateModalVisibility"
          :class="
            searchValue && filterTiles(section.items, searchValue).length === 0
              ? 'no-results'
              : ''
          "
        />
      </template>
    </div>
    <!-- Show message when there's no data to show -->
    <div v-if="checkIfResults()" class="no-data">
      {{ searchValue ? $t("home.no-results") : $t("home.no-data") }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch, type PropType } from "vue";
import { useHome } from "@/composables/useHome";
import SearchBar from "@/components/SearchBar.vue";
import LayoutOptions from "@/components/LayoutOptions/LayoutOptions.vue";
import Section from "@/components/LinkItems/Section.vue";
import { localStorageKeys } from "@/utils/defaults";
import { Section as SectionType } from "@/types/types";

const props = defineProps({
  subPageInfo: {
    type: Object as PropType<{
      confPath?: string;
      pageId?: string;
      pageTitle?: string;
    }>,
    default: undefined,
  },
});

const {
  appStore,
  sections,
  appConfig,
  pageId,
  searchValue,
  filterTiles,
  searching,
  updateModalVisibility,
  checkTheresData,
  checkIfResults,
  getBackgroundImage,
  initiateFontAwesome,
  initiateMaterialDesignIcons,
} = useHome(toRef(props, "subPageInfo"));

const layout = ref("");
const itemSizeBound = ref("");
const filterComp = ref<InstanceType<typeof SearchBar> | null>(null);

/* Whether or not to show the search bar, based on user config */
const searchVisible = computed(() => appStore.visibleComponents.searchBar);

/* Get class for num columns, if specified by user */
const colCount = computed<number | null>(() => {
  let { colCount: userColCount } = appConfig.value;
  if (!userColCount) return null;
  if (userColCount < 1) userColCount = 1;
  if (userColCount > 8) userColCount = 8;
  return userColCount;
});

/* Return all sections, that match users search term */
const filteredTiles = computed(() =>
  sections.value.filter((section: SectionType) =>
    filterTiles(section.items, searchValue.value),
  ),
);

/* Updates layout (when button clicked), and saves in local storage */
const layoutOrientation = computed(() => appStore.layout);

/* Updates icon size (when button clicked), and saves in local storage */
const iconSize = computed(() => appStore.iconSize);

watch(layoutOrientation, (newLayout) => {
  localStorage.setItem(localStorageKeys.LAYOUT_ORIENTATION, newLayout);
  layout.value = newLayout;
});

watch(iconSize, (size) => {
  localStorage.setItem(localStorageKeys.ICON_SIZE, size);
  itemSizeBound.value = size;
});

/* Clears input field, once a searched item is opened */
const finishedSearching = () => {
  if (filterComp.value) filterComp.value.clearFilterInput();
};

/* Returns optional section display preferences if available */
const getDisplayData = (section: SectionType) => {
  return !section.displayData ? {} : section.displayData;
};

initiateFontAwesome();
initiateMaterialDesignIcons();
layout.value = layoutOrientation.value;
itemSizeBound.value = iconSize.value;
</script>

<style lang="scss" scoped>
@use "@/styles/media-queries" as *;
@use "@/styles/style-helpers" as *;

.home {
  display: flex;
  flex-direction: column;
  padding-bottom: 1px;
  background: var(--background);
  min-height: calc(99.9vh - var(--footer-height));
}

/* Toolbar row containing search bar and layout options */
.home-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1rem;
  box-sizing: border-box;
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
}

/* Outside container wrapping the item groups*/
.item-group-container {
  flex: 1;
  padding: 0 1rem;
  box-sizing: border-box;
  min-height: 0;
  display: grid;
  gap: 1.375rem;
  margin: 0 auto;
  width: 100%;
  max-width: 80rem;
  overflow: auto;
  scrollbar-width: 0;
  align-content: start;
  @extend .scroll-bar;
  @include phone {
    flex: none;
    min-height: auto;
    max-width: 100%;
    padding: 0 1rem;
    overflow-x: hidden;
  }

  /* Options for alternate layouts, triggered by buttons */
  &.orientation-horizontal {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    :deep(.collapsable) {
      margin: 10px 0;
    }
  }
  &.orientation-vertical {
    @include tablet-up {
      display: flex;
      flex-direction: row;
    }
  }
  &.orientation-waterfall {
    column-count: 3;
    column-gap: 1.375rem;
    display: block !important;
    @include phone {
      column-count: 1;
    }
    @include tablet {
      column-count: 2;
    }
    @include laptop {
      column-count: 2;
    }
    @include monitor {
      column-count: 3;
    }
    @include big-screen {
      column-count: 4;
    }
    @include big-screen-up {
      column-count: 5;
    }
    & > * {
      break-inside: avoid;
      height: auto !important;
      margin: 0 0 1.375rem !important;
    }
    & .there-are-items {
      height: auto !important;
      display: block !important;
    }
  }
  &.orientation-horizontal,
  &.orientation-vertical {
    max-width: 80rem;
  }

  /* Specify number of columns, based on screen size or user preference */
  @include phone {
    --col-count: 1;
  }
  @include tablet {
    --col-count: 2;
  }
  @include laptop {
    --col-count: 2;
  }
  @include monitor {
    --col-count: 3;
  }
  @include big-screen {
    --col-count: 4;
  }
  @include big-screen-up {
    --col-count: 5;
  }

  @include tablet-up {
    &.col-count-1 {
      --col-count: 1;
    }
    &.col-count-2 {
      --col-count: 2;
    }
    &.col-count-3 {
      --col-count: 3;
    }
    &.col-count-4 {
      --col-count: 4;
    }
    &.col-count-5 {
      --col-count: 5;
    }
    &.col-count-6 {
      --col-count: 6;
    }
    &.col-count-7 {
      --col-count: 7;
    }
    &.col-count-8 {
      --col-count: 8;
    }
  }

  grid-template-columns: repeat(var(--col-count, 2), minmax(0, 1fr));

  /* Hide when search term returns nothing */
  .no-results {
    display: none !important;
  }
}

/* Custom styles only applied when there is no sections in config */
.no-data {
  font-size: 2rem;
  color: var(--background);
  background: #ffffffeb;
  width: fit-content;
  margin: 2rem auto;
  padding: 0.5rem 1rem;
  border-radius: var(--curve-factor);
}
</style>
