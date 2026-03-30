<template>
  <template v-if="application?.affiliationUrl">
    <a-row style="margin-top: 20px">
      <a-col :span="labelSpan" style="margin-top: 5px">
        {{ t('user:Address') }}:
      </a-col>
      <a-col :span="24 - labelSpan">
        <a-cascader
          style="width: 100%; max-width: 400px"
          :value="user?.address"
          :options="addressOptions"
          :placeholder="t('signup:Please input your address!')"
          @change="onAddressChange"
        />
      </a-col>
    </a-row>
  </template>

  <a-row style="margin-top: 20px">
    <a-col :span="labelSpan" style="margin-top: 5px">
      {{ t('user:Affiliation') }}:
    </a-col>
    <a-col :span="22">
      <a-input
        v-if="!application?.affiliationUrl"
        :value="user?.affiliation"
        @change="(e: any) => emit('updateField', 'affiliation', e.target.value)"
      />
      <a-select
        v-else
        :virtual="false"
        style="width: 100%"
        :value="user?.affiliation"
        :options="affiliationSelectOptions"
        @change="onAffiliationChange"
      />
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Application, User } from '../api/types';
import { getAddressOptions, getAffiliationOptions } from '../api/modules/user';

const props = defineProps<{
  application: Application | null;
  user: User | null;
  labelSpan?: number;
}>();

const emit = defineEmits<{
  (e: 'updateField', key: string, value: any): void;
}>();

const { t } = useI18n();
const labelSpan = computed(() => props.labelSpan ?? 6);

const addressOptions = ref<any[]>([]);
const affiliationOptions = ref<any[]>([]);

const affiliationSelectOptions = computed(() => {
  const empty = { label: `(${t('general:empty')})`, value: '' };
  return [empty, ...affiliationOptions.value.map((o: any) => ({ label: o.name, value: o.name }))];
});

async function loadAddressOptions() {
  const url = props.application?.affiliationUrl;
  if (!url) return;
  const addressUrl = url.split('|')[0];
  try {
    const data = await getAddressOptions(addressUrl);
    addressOptions.value = data ?? [];
  } catch { /* ignore */ }
}

async function loadAffiliationOptions() {
  const url = props.application?.affiliationUrl;
  if (!url || !props.user?.address?.length) return;
  const affiliationUrl = url.split('|')[1];
  const code = props.user.address[props.user.address.length - 1];
  try {
    const data = await getAffiliationOptions(affiliationUrl, code as string);
    affiliationOptions.value = data ?? [];
  } catch { /* ignore */ }
}

function onAddressChange(value: any) {
  emit('updateField', 'address', value);
  emit('updateField', 'affiliation', '');
  emit('updateField', 'score', 0);
  loadAffiliationOptions();
}

function onAffiliationChange(value: string) {
  const opt = affiliationOptions.value.find((o: any) => o.name === value);
  emit('updateField', 'affiliation', value);
  if (opt) {
    emit('updateField', 'score', opt.id);
  }
}

onMounted(() => {
  loadAddressOptions();
  loadAffiliationOptions();
});
</script>
