<template>
  <div :class="['entry-layout', isDarkMode ? 'loginBackgroundDark' : 'loginBackground']" :style="bgStyle">
    <a-spin
      v-if="loading"
      size="large"
      :tip="t('login.Loading')"
      class="entry-spin"
    />
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";

const { t } = useI18n();
const appStore = useAppStore();

const loading = ref(false);

const isDarkMode = computed(() => appStore.themeAlgorithm.includes("dark"));

// Background image from application config (will be wired later)
const bgStyle = computed(() => {
  return {};
});
</script>

<style scoped>
.entry-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.entry-spin {
  width: 100%;
  margin: 0 auto;
  position: absolute;
}
</style>
