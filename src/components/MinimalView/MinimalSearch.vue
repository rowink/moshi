<template>
  <SearchBar
    ref="MinimalSearchBar"
    @user-is-searchin="userIsTypingSomething"
    :active="true"
    :minimalSearch="true"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SearchBar from "@/components/SearchBar.vue";
import { useAppStore } from "@/store/modules/appStore";

export default defineComponent({
  name: "MinimalSearch",
  components: {
    SearchBar,
  },
  props: {
    active: Boolean,
  },
  data() {
    return {
      input: "", // Users current search term
    };
  },
  computed: {
    appStore() {
      return useAppStore();
    },
    appConfig() {
      return this.appStore.appConfig;
    },
    webSearchEnabled() {
      if (this.appConfig && this.appConfig.webSearch) {
        return !this.appConfig.webSearch.disableWebSearch;
      }
      return true;
    },
  },
  methods: {
    /* Emmits users's search term up to parent */
    userIsTypingSomething(searchValue: string) {
      this.input = searchValue;
      this.$emit("user-is-searchin", searchValue);
    },
    /* No-op, kept for parity with original JS which referenced an undefined method */
    startFiltering() {},
  },
  mounted() {
    window.addEventListener("keydown", this.startFiltering);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.startFiltering);
  },
});
</script>
