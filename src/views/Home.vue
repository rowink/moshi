<!-- Main homepage for default view -->
<template>
  <div class="home" :style="getBackgroundImage()">
    <!-- Search bar -->
    <SearchBar
      v-if="searchVisible"
      ref="filterComp"
      @user-is-searchin="searching"
    />
    <!-- Show back button, when on single-section view -->
    <div v-if="singleSectionView">
      <router-link to="/home" class="back-to-all-link">
        <BackIcon />
        <span>Back to All</span>
      </router-link>
    </div>
    <!-- Main content, section for each group of items -->
    <div v-if="checkTheresData(sections)"
      :class="`item-group-container `
        + `orientation-${layout} `
        + `item-size-${itemSizeBound} `
        + (singleSectionView ? 'single-section-view ' : '')
        + (this.colCount ? `col-count-${this.colCount} ` : '')"
      >
      <template v-for="(section, index) in filteredTiles">
        <Section
          :key="index"
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
          (searchValue && filterTiles(section.items, searchValue).length === 0) ? 'no-results' : ''"
        />
      </template>
    </div>
    <!-- Show message when there's no data to show -->
    <div v-if="checkIfResults()" class="no-data">
      {{searchValue ? $t('home.no-results') : $t('home.no-data')}}
    </div>
  </div>
</template>

<script>
import HomeMixin from '@/mixins/HomeMixin';
import SearchBar from '@/components/SearchBar.vue';
import Section from '@/components/LinkItems/Section.vue';
import { localStorageKeys } from '@/utils/defaults';
import ErrorHandler from '@/utils/ErrorHandler';
import BackIcon from '@/assets/interface-icons/back-arrow.svg';
import { useAppStore } from '@/store';

export default {
  name: 'home',
  mixins: [HomeMixin],
  components: {
    SearchBar,
    Section,
    BackIcon,
  },
  data: () => ({
    layout: '',
    itemSizeBound: '',
  }),
  computed: {
    appStore() { return useAppStore(); },
    /* Whether or not to show the search bar, based on user config */
    searchVisible() {
      return this.appStore.visibleComponents.searchBar;
    },
    singleSectionView() {
      return this.findSingleSection(this.appStore.sections, this.$route.params.section);
    },
    /* Get class for num columns, if specified by user */
    colCount() {
      let { colCount } = this.appConfig;
      if (!colCount) return null;
      if (colCount < 1) colCount = 1;
      if (colCount > 8) colCount = 8;
      return colCount;
    },
    /* Return all sections, that match users search term */
    filteredTiles() {
      const sections = this.singleSectionView || this.sections;
      return sections.filter((section) => this.filterTiles(section.items, this.searchValue));
    },
    /* Updates layout (when button clicked), and saves in local storage */
    layoutOrientation() {
      return this.appStore.layout;
    },
    /* Updates icon size (when button clicked), and saves in local storage */
    iconSize() {
      return this.appStore.iconSize;
    },
  },
  watch: {
    layoutOrientation(layout) {
      localStorage.setItem(localStorageKeys.LAYOUT_ORIENTATION, layout);
      this.layout = layout;
    },
    iconSize(size) {
      localStorage.setItem(localStorageKeys.ICON_SIZE, size);
      this.itemSizeBound = size;
    },
  },
  methods: {
    /* Clears input field, once a searched item is opened */
    finishedSearching() {
      if (this.$refs.filterComp) this.$refs.filterComp.clearFilterInput();
    },
    /* Returns optional section display preferences if available */
    getDisplayData(section) {
      return !section.displayData ? {} : section.displayData;
    },
    /* If on sub-route, and section exists, then return only that section */
    findSingleSection: (allSections, sectionTitle) => {
      if (!sectionTitle) return undefined;
      let sectionToReturn;
      const parse = (section) => section.replaceAll(' ', '-').toLowerCase().trim();
      allSections.forEach((section) => {
        if (parse(sectionTitle) === parse(section.name || '')) {
          sectionToReturn = [section];
        }
      });
      if (!sectionToReturn) ErrorHandler(`No section named '${sectionTitle}' was found`);
      return sectionToReturn;
    },
  },
  mounted() {
    this.initiateFontAwesome();
    this.initiateMaterialDesignIcons();
    this.layout = this.layoutOrientation;
    this.itemSizeBound = this.iconSize;
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/media-queries' as *;
@use '@/styles/style-helpers' as *;

.home {
  padding-bottom: 1px;
  background: var(--background);
  min-height: calc(99.9vh - var(--footer-height));
}

.back-to-all-link {
  display: flex;
  align-items: center;
  padding: 0.25rem;
  margin: 0.25rem;
  @extend .svg-button;
  svg { margin-right: 0.5rem; }
  text-decoration: none;
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
  &.orientation-horizontal, &.orientation-vertical, &.single-section-view {
    @include phone { --content-max-width: 100%; }
    @include tablet { --content-max-width: 98%; }
    @include laptop { --content-max-width: 90%; }
    @include monitor { --content-max-width: 85%; }
    @include big-screen { --content-max-width: 80%; }
    @include big-screen-up { --content-max-width: 60%; }
    max-width: var(--content-max-width, 90%);
  }

  /* Specify number of columns, based on screen size or user preference */
  @include phone { --col-count: 1; }
  @include tablet { --col-count: 2; }
  @include laptop { --col-count: 2; }
  @include monitor { --col-count: 3; }
  @include big-screen { --col-count: 4; }
  @include big-screen-up { --col-count: 5; }

  @include tablet-up {
    &.col-count-1 { --col-count: 1; }
    &.col-count-2 { --col-count: 2; }
    &.col-count-3 { --col-count: 3; }
    &.col-count-4 { --col-count: 4; }
    &.col-count-5 { --col-count: 5; }
    &.col-count-6 { --col-count: 6; }
    &.col-count-7 { --col-count: 7; }
    &.col-count-8 { --col-count: 8; }
  }

  grid-template-columns: repeat(var(--col-count, 2), minmax(0, 1fr));

  /* Hide when search term returns nothing */
  .no-results { display: none !important; }

  /* When in single-section view mode */
  &.single-section-view {
    display: block;
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
