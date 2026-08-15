<template>
  <div v-if="icon" :class="`item-icon wrapper-${size}`">
    <!-- Font-Awesome Icon -->
    <i v-if="iconType === 'font-awesome'" :class="`${icon} ${size}`"></i>
    <!-- Material Design Icon -->
    <span v-else-if="iconType === 'mdi'" :class="`mdi ${icon} ${size}`"></span>
    <!-- Standard image asset icon -->
    <img
      v-else-if="icon"
      :src="iconPath"
      @error="imageNotFound"
      :class="`tile-icon ${size} ${broken ? 'broken' : ''}`"
    />
    <!-- Icon could not load/ broken url -->
    <BrokenImage v-if="broken" :class="`missing-image ${size}`" />
  </div>
</template>

<script setup lang="ts">
import BrokenImage from "@/assets/interface-icons/broken-icon.svg";
import ErrorHandler from "@/utils/ErrorHandler";
import { asciiHash } from "@/utils/MiscHelpers";
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
const iconType = computed(() => determineImageType(props.icon));
/* Gets the icon path, dependent on icon type */
const iconPath = computed(() => {
  if (broken.value) return getFallbackIcon();
  return getIconPath(props.icon, props.url);
});

const broken = ref(false); // If true, was unable to resolve icon
const attemptedFallback = ref(false);

/* Determine icon type, e.g. local or remote asset, SVG, favicon, font-awesome, etc */
function determineImageType(img: string | undefined) {
  let imgType = "";
  if (!img) imgType = "none";
  else if (isUrl(img)) imgType = "url";
  else if (isImage(img)) imgType = "img";
  else if (img.includes("fa-")) imgType = "font-awesome";
  else if (img.includes("mdi-")) imgType = "mdi";
  else if (img.includes("hl-")) imgType = "home-lab-icons";
  else if (img.includes("favicon-")) imgType = "custom-favicon";
  else if (img === "favicon") imgType = "favicon";
  else if (img === "generative") imgType = "generative";
  else imgType = "none";
  return imgType;
}
/* Return the path to icon asset, depending on icon type */
function getIconPath(img: string | undefined, url: string | undefined) {
  switch (determineImageType(img)) {
    case "url":
      return img;
    case "img":
      return getLocalImagePath(img!);
    case "favicon":
      return getFavicon(url);
    case "custom-favicon":
      return getCustomFavicon(url, img!);
    case "generative":
      return getGenerativeIcon(url);
    case "mdi":
      return img; // Material design icons
    case "home-lab-icons":
      return getHomeLabIcon(img);
    case "svg":
      return img; // Local SVG icon
    default:
      return "";
  }
}
/* Check if a string is in a URL format. Used to identify tile icon source */
function isUrl(str: string) {
  const pattern = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-/]))?/;
  return pattern.test(str);
}
/* Returns true if the input is a path to an image file */
function isImage(img: string) {
  const fileExtRegex = /(?:\.([^.]+))?$/;
  const validImgExtensions = ["svg", "png", "jpg"];
  const splitPath = fileExtRegex.exec(img) || [];
  if (splitPath.length >= 1)
    return validImgExtensions.includes(splitPath[1]);
  return false;
}
/* Get favicon URL, for items which use the favicon as their icon */
function getFavicon(fullUrl: string | undefined, specificApi?: string) {
  const fullUrlTrue = fullUrl || "";
  const faviconApi =
    specificApi || appConfig.value.faviconApi || defaultFaviconApi;
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
/* Get the URL for a favicon, but using the non-default favicon API */
function getCustomFavicon(fullUrl: string | undefined, faviconIdentifier: string) {
  let errorMsg = "";
  const faviconApi = faviconIdentifier.split("favicon-")[1];
  if (!faviconApi) {
    errorMsg = "Favicon API not specified";
  } else if (
    !Object.keys(faviconApiEndpoints).includes(faviconApi) &&
    faviconApi !== "local"
  ) {
    errorMsg = `The specified favicon API, '${faviconApi}' cannot be found.`;
  } else {
    return getFavicon(fullUrl, faviconApi);
  }
  // Error encountered, favicon service not found
  imageNotFound(errorMsg);
  return undefined;
}
/* If using favicon for icon, and if service is running locally (determined by local IP) */
/* or if user prefers local favicon, then return true */
function shouldUseDefaultFavicon(fullUrl: string) {
  const isLocalIP =
    /(127\.)|(192\.168\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(::1$)|([fF][cCdD])|(localhost)/;
  return isLocalIP.test(fullUrl) || appConfig.value.faviconApi === "local";
}
/* Fetches the path of local images, from Docker container */
function getLocalImagePath(img: string) {
  return `/${iconCdns.localPath}/${img}`;
}
/* Formats the URL for fetching the generative icons */
function getGenerativeIcon(url: string | undefined, cdn?: string) {
  const host = encodeURI(url as string) || Math.random().toString();
  return (cdn || iconCdns.generative).replace("{icon}", asciiHash(host));
}
/* Gets home-lab icon from GitHub */
function getHomeLabIcon(img: string | undefined, cdn?: string) {
  const imageName = img!.replace("hl-", "").toLocaleLowerCase();
  return (cdn || iconCdns.homeLabIcons).replace("{icon}", imageName);
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
  broken.value = true;
}
/* Called when initial icon has resulted in 404. Attempts to find new icon */
function getFallbackIcon() {
  if (attemptedFallback.value) return undefined; // If this is second attempt, then give up
  const iconTypeValue = iconType.value || "";
  const markAsAttempted = () => {
    broken.value = false;
    attemptedFallback.value = true;
  };
  if (iconTypeValue.includes("favicon")) {
    // Specify fallback for favicon-based icons
    markAsAttempted();
    return getFavicon(props.url, "local");
  } else if (iconTypeValue === "generative") {
    markAsAttempted();
    return getGenerativeIcon(props.url, iconCdns.generativeFallback);
  } else if (iconTypeValue === "home-lab-icons") {
    markAsAttempted();
    return getHomeLabIcon(props.icon, iconCdns.homeLabIconsFallback);
  }
  return undefined;
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
