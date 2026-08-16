<template>
  <div v-if="icon" :class="`item-icon wrapper-${size}`">
    <img
      v-if="icon"
      :src="iconPath"
      @error="imageNotFound"
      :class="`tile-icon ${size} ${fallbackFailed ? 'broken' : ''}`"
    />
    <!-- Icon could not load/ broken url -->
    <BrokenImage v-if="fallbackFailed" :class="`missing-image ${size}`" />
  </div>
</template>

<script setup lang="ts">
import BrokenImage from "@/assets/interface-icons/broken-icon.svg";
import ErrorHandler from "@/utils/ErrorHandler";
import {
  faviconApi as defaultFaviconApi,
  faviconApiEndpoints,
  iconCdns,
} from "@/utils/defaults";
import { useAppStore } from "@/store/modules/appStore";
import { computed, ref } from "vue";

const props = defineProps({
  icon: String, // Path to icon asset
  url: String, // Used for fetching the favicon
  size: String, // Either small, medium or large
});

const appStore = useAppStore();
/* Get appConfig from store */
const appConfig = computed(() => appStore.appConfig);
/* Determines the type of icon */
/* Gets the icon path, dependent on icon type */
const iconPath = computed(() => {
  if (broken.value) return getFavicon(props.url);
  return props.icon;
});

const broken = ref(false); // Initial icon failed → switch to fallback URL
const fallbackFailed = ref(false); // Fallback icon also failed → show broken placeholder

/* Get favicon URL, for items which use the favicon as their icon */
function getFavicon(fullUrl: string | undefined) {
  const fullUrlTrue = fullUrl || "";
  const faviconApi = appConfig.value.faviconApi || defaultFaviconApi;
  if (shouldUseDefaultFavicon(fullUrlTrue) || faviconApi === "local") {
    // Check if we should use local icon
    const urlParts = fullUrlTrue.split("/");
    if (urlParts.length >= 2)
      return `${urlParts[0]}/${urlParts[1]}/${urlParts[2]}/${iconCdns.faviconName}`;
  } else if (fullUrlTrue.includes("http")) {
    // Service is running publicly

    const host = getHostName(fullUrlTrue);
    const endpoint =
      faviconApiEndpoints[faviconApi as keyof typeof faviconApiEndpoints];
    return endpoint.replace("$URL", host);
  }
  return "";
}
/* If using favicon for icon, and if service is running locally (determined by local IP) */
/* or if user prefers local favicon, then return true */
function shouldUseDefaultFavicon(fullUrl: string) {
  const isLocalIP =
    /(127\.)|(192\.168\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(::1$)|([fF][cCdD])|(localhost)/;
  return isLocalIP.test(fullUrl) || appConfig.value.faviconApi === "local";
}

/* For a given URL, return the hostname only. Used for favicon and generative icons */
function getHostName(url: string) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    ErrorHandler("Unable to format URL");
    return url;
  }
}
/* Called when the path to the image cannot be resolved */
function imageNotFound(errorMsg: unknown) {
  let outputMessage = "";
  if (errorMsg && typeof errorMsg === "string") {
    outputMessage = errorMsg;
  } else if (!props.icon) {
    outputMessage = "Icon not specified";
  } else {
    outputMessage = `The path to '${props.icon}' could not be resolved`;
  }
  ErrorHandler(outputMessage);
  if (broken.value) {
    fallbackFailed.value = true;
  } else {
    broken.value = true;
  }
}
</script>

<style lang="scss">
/* Icon wraper */
.item-icon {
  &.wrapper-medium {
    min-height: 2.5rem;
  }
  &.wrapper-large {
    min-width: 3.5rem;
    text-align: center;
  }
}

/* Default Image Icon */
.tile-icon {
  min-width: 1rem;
  max-width: 2rem;
  min-height: 1rem;
  max-height: 2rem;
  object-fit: cover;
  filter: var(--item-icon-transform);
  border-radius: var(--curve-factor);
  &.small {
    max-width: 1.5rem;
    max-height: 1.5rem;
  }
  &.large {
    max-width: 3rem;
    max-height: 3rem;
  }
  &.broken {
    display: none;
  }
}
/* Font-Awesome and Material Design Icons */
i.fas,
i.fab,
i.far,
i.fal,
i.fad,
span.mdi {
  font-size: 2rem;
  color: currentColor;
  margin: 1px 4px;
  &.small {
    font-size: 1.5rem;
  }
  &.large {
    font-size: 2.5rem;
  }
}
span.mdi {
  font-size: 2.5rem;
}
object.tile-icon {
  width: 55px;
  height: 55px;
  svg,
  svg g,
  svg g path {
    fill: currentColor;
  }
}
/* Icon Not Found */
.missing-image {
  width: 2rem;
  &.small {
    width: 1.5rem !important;
  }
  &.large {
    width: 2.5rem;
  }
  path {
    fill: currentColor;
  }
}
</style>
