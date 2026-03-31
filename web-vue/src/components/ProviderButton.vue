<template>
  <div class="provider-button">
    <a-tooltip :title="providerItem.provider?.displayName || providerItem.provider?.name || ''">
      <a :href="authUrl" @click.prevent="handleClick">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          :alt="providerItem.provider?.name || ''"
          class="provider-logo"
          :style="{ width: iconSize + 'px', height: iconSize + 'px' }"
        />
        <span v-else>{{ providerItem.provider?.displayName || providerItem.provider?.name }}</span>
      </a>
    </a-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import * as Setting from "@/utils/Setting";
import * as Provider from "@/utils/Provider";
import type { Application, ProviderItem } from "@/api/types";

const props = withDefaults(
  defineProps<{
    providerItem: ProviderItem;
    application: Application;
    iconSize?: number;
  }>(),
  { iconSize: 30 }
);

const logoUrl = computed(() => {
  if (!props.providerItem.provider) return "";
  return Setting.getProviderLogoURL(props.providerItem.provider);
});

const authUrl = computed(() => {
  if (!props.providerItem.provider || !props.application) return "#";
  return Provider.getAuthUrl(props.application, props.providerItem.provider, "signup");
});

function handleClick() {
  if (authUrl.value && authUrl.value !== "#") {
    Setting.goToLink(authUrl.value);
  }
}
</script>

<style scoped>
.provider-button {
  display: inline-block;
  margin: 0 5px;
  cursor: pointer;
}

.provider-logo {
  border-radius: 4px;
}
</style>
