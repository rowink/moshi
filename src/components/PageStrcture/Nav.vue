<template>
  <div class="nav-outer" v-if="allLinks && allLinks.length > 0">
    <IconBurger
      :class="`burger ${!navVisible ? 'visible' : ''}`"
      @click="navVisible = !navVisible"
    />
    <!-- Mobile sidebar overlay -->
    <div
      v-if="isMobile"
      :class="`nav-overlay ${navVisible ? 'visible' : ''}`"
      @click="navVisible = false"
    />
    <nav id="nav" :class="{ open: navVisible }">
      <!-- Close button (mobile only) -->
      <IconClose
        v-if="isMobile"
        class="nav-close"
        @click="navVisible = false"
      />
      <!-- Render either router-link or anchor, depending if internal / external link -->
      <template v-for="(link, index) in allLinks" :key="index">
        <router-link
          v-if="!isUrl(link.path)"
          :to="link.path"
          class="nav-item"
          @click="onNavItemClick"
          >{{ link.title }}
        </router-link>
        <a
          v-else
          :href="link.path"
          :target="determineTarget(link)"
          class="nav-item"
          rel="noopener noreferrer"
          @click="onNavItemClick"
          >{{ link.title }}
        </a>
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType, onMounted, onBeforeUnmount } from "vue";
import IconBurger from "@/assets/interface-icons/burger-menu.svg";
import IconClose from "@/assets/interface-icons/close.svg";
import { makePageRoute } from "@/utils/ConfigHelpers";
import { discoveredPages } from "@/utils/discoverPages";
import { useAppStore } from "@/store/modules/appStore";
import { NavLink as NavLinkType } from "@/types/types";

const props = defineProps({
  links: {
    type: Array as PropType<NavLinkType[]>,
    default: () => [],
  },
});

const appStore = useAppStore();

const navVisible = ref(true);
const isMobile = ref(false);

/* Get links to sub-pages, and combine with nav-links.
 * Sub-pages are auto-discovered from src/config/conf-*.yml (weight-sorted),
 * plus any manually specified pages in conf.yml; duplicates are dropped. */
const allLinks = computed(() => {
  const manualSubPages = appStore.pages.map((subPage: Record<string, any>) => ({
    path: makePageRoute(subPage),
    title: subPage.name,
  }));
  const autoSubPages = discoveredPages.map((page) => ({
    path: page.route,
    title: page.name,
  }));
  const seen = new Set<string>();
  const subPages = [...manualSubPages, ...autoSubPages].filter((link) => {
    if (seen.has(link.path)) return false;
    seen.add(link.path);
    return true;
  });
  return [...(props.links || []), ...subPages];
});

/* Keep in sync with $tiny in src/styles/media-queries.scss */
const MOBILE_BREAKPOINT = 600;

function detectMobile() {
  const screenWidth = document.body.clientWidth;
  return !!(screenWidth && screenWidth < MOBILE_BREAKPOINT);
}

/* Re-evaluate layout mode on viewport resize. Only react when crossing
 * the breakpoint, so dragging within one layout never toggles the drawer:
 * shrink to phone -> drawer starts closed (burger visible),
 * grow back to desktop -> sidebar is shown again automatically. */
function updateNavLayout() {
  const wasMobile = isMobile.value;
  isMobile.value = detectMobile();
  if (wasMobile !== isMobile.value) {
    navVisible.value = !isMobile.value;
  }
}

function isUrl(str: string | undefined) {
  return /(http|https):\/\/(\S+)(:[0-9]+)?/.test(str as string);
}

function determineTarget(link: NavLinkType) {
  if (!link.target) return "_blank";
  switch (link.target) {
    case "sametab":
      return "_self";
    case "newtab":
      return "_blank";
    case "parent":
      return "_parent";
    case "top":
      return "_top";
    default:
      return undefined;
  }
}

function onNavItemClick() {
  if (isMobile.value) {
    navVisible.value = false;
  }
}

onMounted(() => {
  navVisible.value = !detectMobile();
  isMobile.value = detectMobile();
  window.addEventListener("resize", updateNavLayout);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateNavLayout);
});
</script>

<style scoped lang="scss">
@use "@/styles/style-helpers" as *;
@use "@/styles/media-queries" as *;

.nav-outer {
  /* Burger icon */
  @extend .svg-button;
  .burger {
    display: none;
    &.visible {
      display: block;
    }
    @include phone {
      display: block;
    }
  }

  /* Desktop: horizontal nav bar */
  nav {
    display: flex;
    align-items: center;
    .nav-item {
      display: inline-block;
      padding: 0.75rem 0.5rem;
      margin: 0.5rem;
      min-width: 5rem;
      text-align: center;
      outline: none;
      border: none;
      border-radius: var(--curve-factor);
      box-shadow: var(--nav-link-shadow);
      color: var(--nav-link-text-color);
      background: var(--nav-link-background-color);
      border: 1px solid var(--nav-link-border-color);
      text-decoration: none;
      &.router-link-active,
      &:hover {
        color: var(--nav-link-text-color-hover);
        background: var(--nav-link-background-color-hover);
        border: 1px solid var(--nav-link-border-color-hover);
        box-shadow: var(--nav-link-shadow-hover);
      }
    }
  }

  /* Mobile sidebar */
  @include phone {
    .nav-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      &.visible {
        opacity: 1;
        pointer-events: auto;
      }
    }

    nav {
      position: fixed;
      top: 0;
      left: 0;
      width: 200px;
      height: 100vh;
      height: 100dvh;
      z-index: 1000;
      background: var(--background-darker);
      flex-direction: column;
      align-items: stretch;
      padding: 3rem 0.5rem 1rem;
      overflow-y: auto;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      &.open {
        transform: translateX(0);
      }
      .nav-close {
        position: absolute;
        top: 0.6rem;
        right: 0.6rem;
        width: 1.1rem;
        height: 1.1rem;
        color: var(--nav-link-text-color);
        opacity: 0.5;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0.2rem;
        &:hover {
          opacity: 1;
        }
      }
      .nav-item {
        margin: 0.15rem 0;
        min-width: 0;
        text-align: left;
        padding: 0.55rem 0.6rem;
        background: none;
        border: none;
        box-shadow: none;
        border-radius: var(--curve-factor);
        &:hover,
        &:active {
          background: var(--nav-link-background-color-hover);
        }
        &.router-link-active {
          color: var(--nav-link-text-color-hover);
          background: var(--nav-link-background-color-hover);
        }
      }
    }
  }
}
</style>
