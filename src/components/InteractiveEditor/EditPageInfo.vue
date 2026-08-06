<template>
  <modal
    :name="modalName" @closed="modalClosed"
    :resizable="true" width="50%" height="80%"
    classes="dashy-modal edit-page-info"
  >
  <div class="edit-page-info-inner" v-if="allowViewConfig">
  <h3>{{ $t('interactive-editor.menu.edit-page-info-btn') }}</h3>
  <FormSchema
    :schema="schema"
    v-model="formData"
    @submit.prevent="saveToState"
    class="page-info-form"
    name="pageInfoForm"
  >
    <Button type="submit">
      {{ $t('interactive-editor.menu.save-stage-btn') }}
      <SaveIcon />
    </Button>
  </FormSchema>
  </div>
  <AccessError v-else />
  </modal>
</template>

<script>
import FormSchema from '@formschema/native';
import DashySchema from '@/utils/ConfigSchema';
import { modalNames } from '@/utils/defaults';
import Button from '@/components/FormElements/Button';
import SaveIcon from '@/assets/interface-icons/save-config.svg';
import AccessError from '@/components/Configuration/AccessError';
import { useAppStore } from '@/store';

export default {
  name: 'EditPageInfo',
  data() {
    return {
      formData: {},
      schema: DashySchema.properties.pageInfo,
      modalName: modalNames.EDIT_PAGE_INFO,
    };
  },
  components: {
    FormSchema,
    Button,
    SaveIcon,
    AccessError,
  },
  mounted() {
    this.formData = this.pageInfo;
  },
  computed: {
    appStore() { return useAppStore(); },
    pageInfo() {
      return this.appStore.pageInfo;
    },
    allowViewConfig() {
      return this.appStore.permissions.allowViewConfig;
    },
  },
  methods: {
    /* When form submitteed, update VueX store with new pageInfo, and close modal */
    saveToState() {
      this.appStore.setPageInfo(this.formData);
      this.$modal.hide(this.modalName);
      this.appStore.setModalOpen(false);
      this.appStore.setEditMode(true);
    },
    /* Called when modal manually closed, updates state to allow searching again */
    modalClosed() {
      this.appStore.setModalOpen(false);
    },
  },
};
</script>

<style lang="scss">
@use '@/styles/style-helpers' as *;
@use '@/styles/media-queries' as *;
@use '@/styles/schema-editor' as *;

.edit-page-info-inner {
  padding: 1rem;
  background: var(--interactive-editor-background);
  color: var(--interactive-editor-color);
  height: 100%;
  overflow-y: auto;
  @extend .scroll-bar;
  h3 {
    font-size: 1.4rem;
    margin: 0.5rem;
  }
  .page-info-form {
    @extend .schema-form;
    margin-bottom: 2.5rem;
  }
}

</style>
