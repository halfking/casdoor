<template>
  <a-row style="margin-top: 20px">
    <a-col :span="labelSpan" style="margin-top: 5px">
      <img
        v-if="providerLogoUrl"
        :src="providerLogoUrl"
        :alt="provider?.type"
        style="width: 30px; height: 30px"
      />
      <span style="margin-left: 5px">{{ provider?.type }}:</span>
    </a-col>
    <a-col :span="24 - labelSpan">
      <a-avatar
        :size="30"
        :src="avatarUrl"
        style="margin-right: 10px"
      />
      <span
        :style="{
          width: labelSpan === 3 ? '300px' : '200px',
          display: isMobile() ? 'inline' : 'inline-block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }"
        :title="displayName"
      >
        <template v-if="!linkedValue">
          ({{ t('general:empty') }})
        </template>
        <template v-else-if="profileUrl">
          <a :href="profileUrl" target="_blank" rel="noreferrer">{{ displayName }}</a>
        </template>
        <template v-else>{{ displayName }}</template>
      </span>

      <!-- Link / Unlink button -->
      <template v-if="!linkedValue">
        <a
          v-if="provider?.category !== 'Web3'"
          :href="canOperate ? getAuthUrl(application, provider!, 'link') : undefined"
        >
          <a-button
            type="primary"
            :disabled="!canOperate"
            :style="{ marginLeft: '20px', width: linkButtonWidth }"
          >
            {{ t('user:Link') }}
          </a-button>
        </a>
        <a-button
          v-else
          type="primary"
          :disabled="!canOperate"
          :style="{ marginLeft: '20px', width: linkButtonWidth }"
        >
          {{ t('user:Link') }}
        </a-button>
      </template>
      <a-button
        v-else
        :disabled="!providerItem.canUnlink && !isAdminUser(account)"
        :style="{ marginLeft: '20px', width: linkButtonWidth }"
        @click="handleUnlink"
      >
        {{ t('user:Unlink') }}
      </a-button>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Application, User } from '../api/types';
import { unlink } from '../api/modules/auth';
import {
  getProviderLogoURL,
  getLanguage,
  isMobile,
  isAdminUser,
  showMessage,
} from '../utils/Setting';
import { getAuthUrl } from '../utils/Provider';

const props = defineProps<{
  application: Application | null;
  user: User | null;
  providerItem: any;
  account: { id?: string; owner?: string; name?: string } | null;
  labelSpan?: number;
}>();

const emit = defineEmits<{
  (e: 'unlinked'): void;
}>();

const { t } = useI18n();
const labelSpan = computed(() => props.labelSpan ?? 6);

const provider = computed(() => props.providerItem?.provider);

const providerLogoUrl = computed(() =>
  provider.value ? getProviderLogoURL(provider.value) : ''
);

const linkedValue = computed(() => {
  if (!props.user || !provider.value?.type) return '';
  return (props.user as any)[provider.value.type.toLowerCase()] ?? '';
});

const canOperate = computed(() => {
  return props.user?.id === props.account?.id;
});

const linkButtonWidth = computed(() =>
  getLanguage() === 'id' ? '160px' : '110px'
);

function getUserProperty(propName: string): string {
  if (!props.user?.properties || !provider.value?.type) return '';
  return (props.user.properties as any)[`oauth_${provider.value.type}_${propName}`] ?? '';
}

const avatarUrl = computed(() => {
  const url = getUserProperty('avatarUrl');
  return url || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAAHElEQVR42mNkoAAwjmoe1TyqeVTzqOZRzcNZMwB18wAfEFQkPQAAAABJRU5ErkJggg==';
});

const displayName = computed(() => {
  const username = getUserProperty('username');
  const dn = getUserProperty('displayName');
  const id = getUserProperty('id');
  const email = getUserProperty('email');

  if (username) return dn ? `${dn} (${username})` : username;
  if (dn) return dn;
  if (id) return id;
  if (email) return email;
  return linkedValue.value || '';
});

const profileUrl = computed(() => {
  if (!provider.value) return '';
  if (provider.value.type === 'GitHub') {
    return `https://github.com/${getUserProperty('username')}`;
  }
  if (provider.value.type === 'Google') {
    return 'https://mail.google.com';
  }
  return '';
});

async function handleUnlink() {
  if (!provider.value?.type) return;
  try {
    const res = await unlink({
      providerType: provider.value.type,
      user: props.user,
    });
    if (res.status === 'ok') {
      showMessage('success', 'Unlinked successfully');
      emit('unlinked');
    } else {
      showMessage('error', `${t('general:Failed to unlink')}: ${res.msg}`);
    }
  } catch (err: any) {
    showMessage('error', err.message);
  }
}
</script>
