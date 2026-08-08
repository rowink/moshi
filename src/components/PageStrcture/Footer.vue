<template>
  <!-- User Footer -->
  <footer v-if="text && text !== '' && visible" v-html="text"></footer>
  <!-- Default Footer -->
  <footer v-else-if="visible">
    <span v-if="appStore.currentConfigInfo" class="path-to-config">
      Using: {{ appStore.currentConfigInfo.confPath }}
    </span>
    <span>
      <template v-if="authorName">
        {{ $t("footer.dev-by") }} <a :href="authorUrl">{{ authorName }}</a
        >.
      </template>
      <template v-if="licenseUrl">
        {{ $t("footer.licensed-under") }}
        <a :href="licenseUrl">{{ license }}</a>
      </template>
      <template v-if="showCopyright && date">© {{ date }}.</template>
      <template v-if="repoUrl">
        {{ $t("footer.get-the") }}
        <a :href="repoUrl">{{ $t("footer.source-code") }}</a
        >.
      </template>
    </span>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { shouldBeVisible } from "@/utils/SectionHelpers";
import { useAppStore } from "@/store/modules/appStore";

withDefaults(
  defineProps<{
    text?: string;
    authorName?: string;
    authorUrl?: string;
    license?: string;
    licenseUrl?: string;
    date?: string;
    showCopyright?: boolean;
    repoUrl?: string;
  }>(),
  {
    authorName: "",
    authorUrl: "",
    license: "MIT",
    licenseUrl: "",
    date: `${new Date().getFullYear()}`,
    showCopyright: true,
    repoUrl: "",
  },
);

const route = useRoute();
const appStore = useAppStore();

const visible = computed(() => shouldBeVisible(route.name as string));
</script>

<style scoped lang="scss">
@use "@/styles/media-queries" as *;

footer {
  width: calc(100% - 0.5rem);
  bottom: 0;
  padding: 0.25rem;
  text-align: center;
  color: var(--medium-grey);
  opacity: var(--dimming-factor);
  background: var(--footer-background);
  margin-top: 1.5rem;
  border-top: 1px solid var(--outline-color);
  @include tablet-down {
    display: none;
  }
  span.path-to-config {
    float: right;
    font-size: 0.75rem;
    margin: 0.1rem 0.5rem 0 0;
    opacity: var(--dimming-factor);
    max-width: 10rem;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    max-height: 1rem;
  }
}

footer a {
  color: var(--footer-text-color);
  &:hover {
    color: var(--footer-text-color-link);
  }
}
</style>
