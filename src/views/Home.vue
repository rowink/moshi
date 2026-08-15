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
      <template v-for="(section, index) in filteredTiles" :key="index">
        <Section
          :index="index"
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
import { localStorageKeys } from "@/config/defaults";
import { Section as SectionType } from "@/types/types";

const props = defineProps({
  subPageInfo: {
    type: Object as PropType<{ confPath?: string; pageId?: string; pageTitle?: string }>,
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
  padding-bottom: 1px;
  background: var(--background);
  min-height: calc(99.9vh - var(--footer-height));
}

/* Toolbar row containing search bar and layout options */.home-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1rem;
  max-width: 90%;
  margin: 0 auto;
}

/* Outside container wrapping the item groups*/
.item-group-container {
  display: grid;
  gap: 0.5rem;
  margin: 0 auto;
  max-width: 90%;
  overflow: auto;
  @extend .scroll-bar;
  @include monitor-up {
    max-width: 85%;
  }

  /* Options for alternate layouts, triggered by buttons */
  &.orientation-horizontal {
    display: flex;
    flex-direction: column;
  }
  &.orientation-vertical {
    max-width: 100%;
    @include tablet-up {
      display: flex;
      flex-direction: row;
    }
  }
  &.orientation-horizontal,
  &.orientation-vertical {
    @include phone {
      --content-max-width: 100%;
    }
    @include tablet {
      --content-max-width: 98%;
    }
    @include laptop {
      --content-max-width: 90%;
    }
    @include monitor {
      --content-max-width: 85%;
    }
    @include big-screen {
      --content-max-width: 80%;
    }
    @include big-screen-up {
      --content-max-width: 60%;
    }
    max-width: var(--content-max-width, 90%);
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
