<template>
  <div :class="`minimal-section-inner ${selected ? 'selected' : ''} ${showAll ? 'show-all': ''}`">
    <div class="section-items" v-if="items && (selected || showAll)">
      <template v-for="(item) in items">
        <SubItemGroup
          v-if="item.subItems"
          :key="item.id"
          :itemId="item.id"
          :title="item.title"
          :subItems="item.subItems"
          @triggerModal="triggerModal"
        />
        <Item
          v-else
          :item="item"
          :key="item.id"
          :itemSize="itemSize"
          :parentSectionTitle="title"
          @itemClicked="$emit('itemClicked')"
          @triggerModal="triggerModal"
          :isAddNew="false"
          :sectionDisplayData="displayData"
        />
      </template>
    </div>
    <div v-if="selected && !showAll && items.length < 1" class="empty-section">
      <p>{{ $t('home.no-items-section') }}</p>
    </div>
    <IframeModal
      :ref="`iframeModal-${groupId}`"
      :name="`iframeModal-${groupId}`"
      @closed="$emit('itemClicked')"
    />
  </div>
</template>

<script>
import Item from '@/components/LinkItems/Item.vue';
import SubItemGroup from '@/components/LinkItems/SubItemGroup.vue';
import IframeModal from '@/components/LinkItems/IframeModal.vue';

export default {
  name: 'ItemGroup',
  props: {
    groupId: String,
    title: String,
    icon: String,
    displayData: Object,
    items: Array,
    itemSize: String,
    modalOpen: Boolean,
    index: Number,
    selected: Boolean,
    showAll: Boolean,
  },
  computed: {
    appConfig() {
      return this.$store.getters.appConfig;
    },
  },
  components: {
    Item,
    SubItemGroup,
    IframeModal,
  },
  methods: {
    selectSection(index) {
      this.$emit('sectionSelected', index);
    },
    /* Returns a unique lowercase string, based on name, for section ID */
    makeId(str) {
      if (!str) return 'unnamed-item';
      return str.replace(/\s+/g, '-').replace(/[^a-zA-Z ]/g, '').toLowerCase();
    },
    /* Opens the iframe modal */
    triggerModal(url) {
      this.$refs[`iframeModal-${this.groupId}`].show(url);
    },
    shouldEnableStatusCheck(itemPreference) {
      const globalPreference = this.appConfig.statusCheck || false;
      return itemPreference !== undefined ? itemPreference : globalPreference;
    },
    getStatusCheckInterval() {
      let interval = this.appConfig.statusCheckInterval;
      if (!interval) return 0;
      if (interval > 60) interval = 60;
      if (interval < 1) interval = 0;
      return interval;
    },
  },
};
</script>

<style scoped lang="scss">
@use '@/styles/media-queries' as *;
@use '@/styles/style-helpers' as *;

.minimal-section-inner {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  background: var(--minimal-view-group-background);
  border-radius: 0 0 var(--curve-factor) var(--curve-factor);
  .section-items {
    display: grid;
    @include phone { --minimal-col-count: 1; }
    @include tablet { --minimal-col-count: 2; }
    @include laptop { --minimal-col-count: 3; }
    @include monitor { --minimal-col-count: 4; }
    @include big-screen { --minimal-col-count: 5; }
    @include big-screen-up { --minimal-col-count: 6; }
    grid-template-columns: repeat(var(--minimal-col-count, 1), minmax(0, 1fr));
  }
  .empty-section {
    padding: 1rem;
    margin: 0.5rem auto;
    color: var(--minimal-view-group-color);
    font-size: 1rem;
    font-style: italic;
    opacity: var(--dimming-factor);
  }
  &.selected {
    border: 1px solid var(--minimal-view-group-color);
    grid-column-start: span var(--col-count, 3);
    &:not(.show-all) { min-height: 300px; }
  }
  &.show-all {
    border: none;
  }
}

</style>
