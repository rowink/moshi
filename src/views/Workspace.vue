<template>
  <div class="work-space">
    <SideBar
      :sections="sections"
      @launch-app="launchApp"
      :initUrl="getInitialUrl()"
    />
    <WebContent :url="url" v-if="!isMultiTaskingEnabled" />
    <MultiTaskingWebComtent :url="url" v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import useHome from "@/composables/useHome";
import SideBar from "@/components/Workspace/SideBar.vue";
import WebContent from "@/components/Workspace/WebContent.vue";
import MultiTaskingWebComtent from "@/components/Workspace/MultiTaskingWebComtent.vue";
import Defaults from "@/utils/defaults";
import {
  GetTheme,
  ApplyLocalTheme,
  ApplyCustomVariables,
} from "@/utils/ThemeHelper";

const route = useRoute();
const { appConfig, sections, setTheme } = useHome();

const url = ref<string | undefined>("");
const isMultiTaskingEnabled = computed(
  () => appConfig.value.enableMultiTasking || false,
);

function launchApp(options: Record<string, any>) {
  if (options.target === "newtab") {
    window.open(options.url, "_blank");
  } else {
    url.value = options.url;
  }
}

function initiateFontAwesome() {
  const fontAwesomeScript = document.createElement("script");
  const faKey = appConfig.value.fontAwesomeKey || Defaults.fontAwesomeKey;
  fontAwesomeScript.setAttribute(
    "src",
    `https://kit.fontawesome.com/${faKey}.js`,
  );
  document.head.appendChild(fontAwesomeScript);
}

/* Returns a service URL, if set as a URL param, or if user has specified landing URL */
function getInitialUrl() {
  if (route.query && route.query.url) {
    return decodeURI(route.query.url as string);
  } else if (appConfig.value.workspaceLandingUrl) {
    return appConfig.value.workspaceLandingUrl;
  }
  return undefined;
}

setTheme();
initiateFontAwesome();
url.value = getInitialUrl() || "";
</script>

<style scoped lang="scss">
.work-space {
  min-height: calc(100vh - var(--footer-height));
}
</style>
