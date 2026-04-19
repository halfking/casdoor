<template>
  <BaseEntityModal
    :open="true"
    :title="modalTitle"
    :entity="entity"
    :fields="resolvedFields"
    :loading="loading"
    :submitting="submitting"
    @cancel="handleCancel"
    @change="handleDraftChange"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BaseEntityModal from "@/components/common/BaseEntityModal.vue";
import type { ResourceConfig, SelectOption } from "@/types/management";
import { getResourceContext, showMessage } from "@/utils/management";

const props = defineProps<{
  resource: ResourceConfig;
  isAccount?: boolean;
  accountPage?: boolean;
}>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const loading = ref(false);
const submitting = ref(false);
const entity = ref<Record<string, unknown> | null>(null);
const optionStore = ref<Record<string, SelectOption[]>>({});

const context = computed(() => getResourceContext());
const isCreate = computed(() => String(route.name || "").endsWith("-new"));
const modalTitle = computed(() => t(isCreate.value ? props.resource.createTitle : props.resource.editTitle));
const routeState = computed(() => ({
  params: route.params as Record<string, unknown>,
  query: route.query as Record<string, unknown>,
}));

const resolvedFields = computed(() =>
  props.resource.fields.map((field) => ({
    ...field,
    options: field.optionSource ? optionStore.value[field.optionSource] || [] : field.options,
  })),
);

async function loadOptions(currentEntity: Record<string, unknown>) {
  if (!props.resource.loadOptions) {
    optionStore.value = {};
    return;
  }

  optionStore.value = await props.resource.loadOptions(currentEntity, context.value, routeState.value);
}

async function loadEntity() {
  loading.value = true;

  try {
    if (isCreate.value) {
      entity.value = props.resource.createDefault(context.value, routeState.value);
    } else {
      const response = await props.resource.get(route.params as Record<string, unknown>);
      entity.value = props.resource.transformLoaded ? props.resource.transformLoaded(response.data) : response.data;
    }

    if (entity.value) {
      await loadOptions(entity.value);
    }
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    loading.value = false;
  }
}

async function handleSubmit(formValue: Record<string, unknown>) {
  submitting.value = true;

  try {
    const payload = props.resource.normalize ? props.resource.normalize(formValue) : formValue;
    if (isCreate.value) {
      await props.resource.create(payload);
      showMessage("success", "Successfully added");
    } else {
      await props.resource.update(route.params as Record<string, unknown>, payload);
      showMessage("success", "Successfully saved");
    }

    await router.push(props.resource.listRoute(context.value));
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    submitting.value = false;
  }
}

async function handleCancel() {
  await router.push(props.resource.listRoute(context.value));
}

function handleDraftChange(formValue: Record<string, unknown>) {
  entity.value = formValue;
}

watch(
  () => [entity.value?.owner, entity.value?.organization, entity.value?.category],
  async (currentValue, previousValue) => {
    if (!entity.value || JSON.stringify(currentValue) === JSON.stringify(previousValue)) {
      return;
    }

    await loadOptions(entity.value);
  },
);

watch(
  () => route.fullPath,
  () => {
    void loadEntity();
  },
);

onMounted(() => {
  void loadEntity();
});
</script>
