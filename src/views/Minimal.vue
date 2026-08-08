<template>
  <div class="minimal-home" :style="getBackgroundImage() + setColumnCount()">
    <!-- Page title and search bar -->
    <div class="title-and-search">
      <router-link to="/">
        <h1>{{ pageInfo.title }}</h1>
      </router-link>
      <MinimalSearch
        @user-is-searchin="handleSearchInput"
        :active="!modalOpen"
        ref="filterComp"
      />
    </div>
    <div
      v-if="checkTheresData(sections)"
      :class="`item-group-container ${!tabbedView ? 'showing-all' : ''}`"
    >
      <!-- Section heading buttons -->
      <MinimalHeading
        v-for="(section, index) in getSections(sections)"
        :key="`heading-${index}`"
        :index="index"
        :title="section.name"
        :icon="section.icon"
        :selected="selectedSection === index"
        @sectionSelected="sectionSelected"
        class="headings"
        :hideTitleText="sections.length > 8"
      />
      <!-- Section item groups -->
      <MinimalSection
        v-for="(section, index) in getSections(sections)"
        :key="`body-${index}`"
        :index="index"
        :title="section.name"
        :icon="section.icon || undefined"
        :groupId="`section-${index}`"
        :items="filterTiles(section.items)"
        :selected="selectedSection === index"
        :showAll="!tabbedView"
        itemSize="small"
        @sectionSelected="sectionSelected"
        @itemClicked="finishedSearching()"
        @change-modal-visibility="updateModalVisibility"
      />
      <div v-if="checkIfResults()" class="no-data">
        {{ searchValue ? $t("home.no-results") : $t("home.no-data") }}
      </div>
    </div>
    <div v-else class="no-data">{{ $t("home.no-data") }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useHome } from "@/composables/useHome";
import MinimalSection from "@/components/MinimalView/MinimalSection.vue";
import MinimalHeading from "@/components/MinimalView/MinimalHeading.vue";
import MinimalSearch from "@/components/MinimalView/MinimalSearch.vue";
import { localStorageKeys } from "@/utils/defaults";
import { Section as SectionType } from "@/types/types";

const {
  sections,
  appConfig,
  pageInfo,
  modalOpen,
  searchValue,
  filterTiles,
  updateModalVisibility,
  checkTheresData,
  initiateFontAwesome,
  initiateMaterialDesignIcons,
  setTheme,
} = useHome();

const selectedSection = ref(0); // The index of currently selected section
const tabbedView = ref(true); // By default use tabs, when searching then show all instead
const filterComp = ref<InstanceType<typeof MinimalSearch> | null>(null);

watch(searchValue, () => {
  tabbedView.value = !searchValue.value || searchValue.value.length === 0;
});

const handleSearchInput = (s: string) => {
  searchValue.value = s;
};

const sectionSelected = (index: number) => {
  selectedSection.value = index;
};

/* Returns sections from local storage if available, otherwise uses the conf.yml */
const getSections = (allSections: SectionType[]) => {
  // If the user has stored sections in local storage, return those
  const localSections = localStorage[localStorageKeys.CONF_SECTIONS];
  if (localSections) {
    const json = JSON.parse(localSections);
    if (json.length >= 1) return json;
  }
  // Otherwise, return the usuall data from conf.yml
  return allSections;
};

/* Clears input field, once a searched item is opened */
const finishedSearching = () => {
  if (filterComp.value) filterComp.value.clearMinFilterInput();
};

/* Returns true if there is more than 1 sub-result visible during searching */
const checkIfResults = () => {
  if (!sections.value) return false;
  else {
    let itemsFound = true;
    sections.value.forEach((section: SectionType) => {
      if (filterTiles(section.items).length > 0) {
        itemsFound = false;
      }
    });
    return itemsFound;
  }
};

/* Make CSS to set the number of columns based on the number of sections */
const setColumnCount = () => {
  return `--col-count: ${sections.value.length};`;
};

/* Make CSS styles to apply the users custom background image */
const getBackgroundImage = () => {
  if (appConfig.value && appConfig.value.backgroundImg) {
    return `background: url('${appConfig.value.backgroundImg}') no-repeat center fixed;background-size:cover;`;
  }
  return "";
};

initiateFontAwesome();
initiateMaterialDesignIcons();
setTheme();
</script>

<style lang="scss" scoped>
@use "@/styles/media-queries" as *;
@use "@/styles/style-helpers" as *;

.minimal-home {
  display: flex;
  flex-direction: column;
  margin: 1rem auto;
  padding-bottom: 1px;
  padding-top: 10vh;
  min-height: calc(99vh - var(--footer-height));
  width: 90%;
  max-width: 1000px;
  background: var(--minimal-view-background-color);
}

.title-and-search {
  text-align: center;
  h1 {
    color: var(--minimal-view-title-color);
    margin: 0;
    font-size: 3rem;
  }
  a {
    text-decoration: none;
  }
}

/* Outside container wrapping the item groups*/
.item-group-container {
  display: grid;
  gap: 0 0.5rem;
  margin: 3rem auto;
  width: 90%;
  grid-template-columns: repeat(var(--col-count), 1fr);
  @extend .scroll-bar;

  &.showing-all {
    flex-direction: column;
    display: flex;
    .headings {
      display: none;
    }
  }
}

@include phone {
  .item-group-container {
    display: flex;
    flex-direction: column;
  }
}

.no-data {
  font-size: 2rem;
  color: var(--minimal-view-background-color);
  background: #ffffffeb;
  width: fit-content;
  margin: 2rem auto;
  padding: 0.5rem 1rem;
  border-radius: var(--curve-factor);
}
</style>
