<template>
  <SearchBar
    ref="MinimalSearchBar"
    @user-is-searchin="userIsTypingSomething"
    :active="true"
    :minimalSearch="true"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import SearchBar from "@/components/SearchBar.vue";
import { useAppStore } from "@/store/modules/appStore";

defineProps({
  active: Boolean,
});

const emit = defineEmits(["user-is-searchin"]);

const appStore = useAppStore();
const appConfig = computed(() => appStore.appConfig);
const webSearchEnabled = computed(() => {
  if (appConfig.value && appConfig.value.webSearch) {
    return !appConfig.value.webSearch.disableWebSearch;
  }
  return true;
});

const input = ref(""); // Users current search term
const MinimalSearchBar = ref<InstanceType<typeof SearchBar> | null>(null);

/* Emmits users's search term up to parent */
function userIsTypingSomething(searchValue: string) {
  input.value = searchValue;
  emit("user-is-searchin", searchValue);
}
/* Clears the inner search bar input (delegates to SearchBar) */
function clearMinFilterInput() {
  MinimalSearchBar.value?.clearFilterInput();
}
/* No-op, kept for parity with original JS which referenced an undefined method */
function startFiltering() {}

onMounted(() => {
  window.addEventListener("keydown", startFiltering);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", startFiltering);
});

defineExpose({ clearMinFilterInput });
</script>
