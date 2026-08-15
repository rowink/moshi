<template>
  <div class="nav-outer" v-if="allLinks && allLinks.length > 0">
    <IconBurger
      :class="`burger ${!navVisible ? 'visible' : ''}`"
      @click="navVisible = !navVisible"
    />
    <nav id="nav" v-if="navVisible">
      <!-- Render either router-link or anchor, depending if internal / external link -->
      <template v-for="(link, index) in allLinks" :key="index">
        <router-link
          v-if="!isUrl(link.path)"
          :to="link.path"
          class="nav-item"
          >{{ link.title }}
        </router-link>
        <a
          v-else
          :href="link.path"
          :target="determineTarget(link)"
          class="nav-item"
          rel="noopener noreferrer"
          >{{ link.title }}
        </a>
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from "vue";
import IconBurger from "@/assets/interface-icons/burger-menu.svg";
import { makePageRoute } from "@/utils/ConfigHelpers";
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

/* Get links to sub-pages, and combine with nav-links */
const allLinks = computed(() => {
  const subPages = appStore.pages.map((subPage: Record<string, any>) => ({
    path: makePageRoute(subPage),
    title: subPage.name,
  }));
  return [...(props.links || []), ...subPages];
});

function detectMobile() {
  const screenWidth = document.body.clientWidth;
  return !!(screenWidth && screenWidth < 600);
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

navVisible.value = !detectMobile();
isMobile.value = detectMobile();
</script>

<style scoped lang="scss">
@use "@/styles/style-helpers" as *;
@use "@/styles/media-queries" as *;

.nav-outer {
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
  /* Mobile and Burger-Menu Styles */
  @extend .svg-button;
  @include phone {
    width: 100%;
    nav {
      flex-wrap: wrap;
    }
  }
  .burger {
    display: none;
    &.visible {
      display: block;
    }
    @include phone {
      display: block;
    }
  }
}
</style>
