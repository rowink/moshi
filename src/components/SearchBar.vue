<template>
  <form
    @submit.prevent="searchSubmitted"
    class="normal"
  >
    <label for="filter-tiles">{{ $t("search.search-label") }}</label>
    <div class="search-wrap">
      <input
        id="filter-tiles"
        v-model="input"
        ref="filter"
        :placeholder="$t('search.search-placeholder')"
        v-on:input="userIsTypingSomething"
        @keydown.esc="clearFilterInput"
      />
      <p
        v-if="!searchPrefs.disableWebSearch && input.length > 0"
        class="web-search-note"
      >
        {{ $t("search.enter-to-search-web") }}
      </p>
    </div>
    <i
      v-if="input.length > 0"
      class="clear-search"
      :title="$t('search.clear-search-tooltip')"
      @click="clearFilterInput"
      >x</i
    >
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import ArrowKeyNavigation from "@/utils/ArrowKeyNavigation";
import ErrorHandler from "@/utils/ErrorHandler";
import { getCustomKeyShortcuts } from "@/utils/ConfigHelpers";
import { useAppStore } from "@/store/modules/appStore";
import {
  getSearchEngineFromBang,
  findUrlForSearchEngine,
  stripBangs,
} from "@/utils/Search";
import {
  searchEngineUrls,
  defaultSearchEngine,
  defaultSearchOpeningMethod,
  searchBangs as defaultSearchBangs,
} from "@/utils/defaults";

const emit = defineEmits(["user-is-searchin"]);

const input = ref(""); // Users current search term
const akn = new ArrowKeyNavigation(); // Class that manages arrow key naviagtion
const filter = ref<HTMLInputElement | null>(null);

const appStore = useAppStore();
const active = computed(() => !appStore.modalOpen);
const searchPrefs = computed(() => appStore.webSearch || {});

/* Call correct function dependending on which key is pressed */
function handleKeyPress(event: KeyboardEvent) {
  const currentElem = document.activeElement
    ? document.activeElement.id
    : "";
  const { key, keyCode } = event;
  const notAlreadySearching = currentElem !== "filter-tiles";
  // If a modal is open, then do nothing
  if (!active.value) return;
  if (/^[/:!a-zA-Z]$/.test(key) && notAlreadySearching) {
    // Letter or bang key pressed - start searching
    if (filter.value) filter.value.focus();
    userIsTypingSomething();
  } else if (/^[0-9]$/.test(key)) {
    // Number key pressed, check if user has a custom binding
    handleHotKey(key);
  } else if (keyCode >= 37 && keyCode <= 40) {
    // Arrow key pressed - start navigation
    akn.arrowNavigation(keyCode);
  } else if (keyCode === 27) {
    // Esc key pressed - reset form
    clearFilterInput();
  }
}
/* Emmits users's search term up to parent */
function userIsTypingSomething() {
  emit("user-is-searchin", input.value);
}
/* Resets everything to initial state, when user is finished */
function clearFilterInput() {
  input.value = ""; // Clear input model
  userIsTypingSomething(); // Emmit new empty value
  (document.activeElement as HTMLElement)?.blur(); // Remove focus
  akn.resetIndex(); // Reset current element index
}
/* If configured, launch specific app when hotkey pressed */
function handleHotKey(key: string) {
  const usersHotKeys = getCustomKeyShortcuts();
  usersHotKeys.forEach((hotkey: Record<string, any>) => {
    if (hotkey.hotkey === parseInt(key, 10)) {
      if (hotkey.url) window.open(hotkey.url, "_blank");
    }
  });
}
/* Launch search results, with users desired opening method */
function launchWebSearch(url: string, method: string) {
  switch (method) {
    case "newtab":
      window.open(url, "_blank");
      break;
    case "sametab":
      window.open(url, "_self");
      break;
    default:
      ErrorHandler(`Unknown opening method: ${method}`);
      window.open(url, "_blank");
  }
}

/* Launch web search, to correct search engine, passing in users query */
function searchSubmitted() {
  // Get search preferences from appConfig
  if (!searchPrefs.value.disableWebSearch) {
    // Only proceed if user hasn't disabled web search
    const bangList = {
      ...defaultSearchBangs,
      ...(searchPrefs.value.searchBangs || {}),
    };
    const openingMethod =
      searchPrefs.value.openingMethod || defaultSearchOpeningMethod;
    const searchBang = getSearchEngineFromBang(input.value, bangList);
    const searchEngine = searchPrefs.value.searchEngine || defaultSearchEngine;
    // Use either search bang, or preffered search engine
    const desiredSearchEngine = searchBang || searchEngine;
    const isCustomSearch =
      searchPrefs.value.searchEngine === "custom" &&
      searchPrefs.value.customSearchEngine;
    const searchUrl = isCustomSearch
      ? searchPrefs.value.customSearchEngine
      : findUrlForSearchEngine(desiredSearchEngine, searchEngineUrls);
    if (searchUrl) {
      // Append search query to URL, and launch
      const fullUrl = searchUrl + encodeURIComponent(stripBangs(input.value, bangList));
      launchWebSearch(fullUrl, openingMethod);
      clearFilterInput();
    }
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyPress);
});

defineExpose({ clearFilterInput, userIsTypingSomething });
</script>

<style scoped lang="scss">
@use "@/styles/media-queries" as *;

form.normal {
  display: flex;
  align-items: center;
  border-radius: 0 0 var(--curve-factor-navbar) 0;
  padding: 0 0.2rem 0.2rem 0;
  .search-wrap {
    display: flex;
    flex-direction: column;
    width: 100%;
    p.web-search-note {
      margin: 0 0.5rem;
      font-size: 0.8rem;
      color: var(--settings-text-color);
      opacity: var(--dimming-factor);
    }
  }
  label {
    display: inline;
    color: var(--search-label-color);
    margin: 0.5rem;
    display: inline;
    word-break: keep-all;
  }
  input {
    display: inline-block;
    width: 200px;
    height: 1rem;
    padding: 0.5rem;
    margin: 0.5rem;
    outline: none;
    border: none;
    border-radius: var(--curve-factor);
    background: var(--search-field-background);
    color: var(--settings-text-color);
    border: 1px solid var(--outline-color);
    &:focus {
      border-color: var(--settings-text-color);
      opacity: var(--dimming-factor);
    }
  }
  .clear-search {
    color: var(--settings-text-color);
    padding: 0 0.3rem 0.1rem 0.3rem;
    font-style: normal;
    font-size: 1rem;
    opacity: var(--dimming-factor);
    border-radius: 50px;
    cursor: pointer;
    right: 0.5rem;
    top: 1rem;
    border: 1px solid var(--settings-text-color);
    margin: 0.25rem;
    &:hover {
      opacity: 1;
      background: var(--background-darker);
    }
  }
}

@include tablet {
  form.normal {
    display: block;
    text-align: center;
  }
}
@include phone {
  form.nomral {
    flex: 1;
    border-radius: 0;
    text-align: center;
    padding: 0.25rem 0;
    display: block;
  }
}
</style>
