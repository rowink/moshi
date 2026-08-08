<template>
  <router-link to="/" class="page-titles">
    <!-- Optional page logo image -->
    <img v-if="logo" :src="logo" class="site-logo" />
    <!-- Page heading and sub-heading -->
    <div class="text">
      <h1>{{ title }}</h1>
      <span class="subtitle">{{ description }}</span>
    </div>
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAppStore } from "@/store/modules/appStore";

export default defineComponent({
  name: "PageTitle",
  props: {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
  },
  computed: {
    appStore() {
      return useAppStore();
    },
  },
});
</script>

<style scoped lang="scss">
@use "@/styles/media-queries" as *;

.page-titles {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  text-decoration: none;
  position: relative;
  h1 {
    color: var(--heading-text-color);
    font-size: 2.5rem;
    margin: 0;
  }
  span.subtitle {
    color: var(--heading-text-color);
    font-style: italic;
    text-shadow: 1px 1px 2px #130f23;
    opacity: var(--dimming-factor);
  }
  img.site-logo {
    margin: 0.2rem 0.5rem 0.2rem 0;
    max-width: 3.5rem;
    height: fit-content;
  }
  @include phone {
    flex-direction: column;
    text-align: center;
    padding: 0.25rem 0;
  }
}
</style>
