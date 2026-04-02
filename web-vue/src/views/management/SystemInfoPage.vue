<template>
  <div class="system-info-container">
    <PageHeader :title="$t('general:System Info')">
      <template #extra>
        <a-button @click="fetchData" :loading="loading">
          {{ $t("general:Refresh") }}
        </a-button>
      </template>
    </PageHeader>

    <div class="content-wrapper">
      <a-spin :spinning="loading">
        <a-row :gutter="[16, 16]">
          <!-- CPU Usage -->
          <a-col :xs="24" :sm="12">
            <a-card :title="$t('system:CPU Usage')" class="info-card">
              <div v-if="systemInfo.cpuUsage && systemInfo.cpuUsage.length > 0">
                <div v-for="(usage, index) in systemInfo.cpuUsage" :key="index" class="progress-item">
                  <span class="label">Core {{ index }}</span>
                  <a-progress :percent="Number(usage.toFixed(1))" size="small" />
                </div>
              </div>
              <a-empty v-else />
            </a-card>
          </a-col>

          <!-- Memory Usage -->
          <a-col :xs="24" :sm="12">
            <a-card :title="$t('system:Memory Usage')" class="info-card memory-card">
              <div v-if="systemInfo.memoryTotal > 0" class="memory-content">
                <div class="memory-text">
                  {{ formatFileSize(systemInfo.memoryUsed) }} / {{ formatFileSize(systemInfo.memoryTotal) }}
                </div>
                <a-progress
                  type="circle"
                  :percent="Number(((systemInfo.memoryUsed / systemInfo.memoryTotal) * 100).toFixed(2))"
                  :width="120"
                />
              </div>
              <a-empty v-else />
            </a-card>
          </a-col>

          <!-- Versions & About -->
          <a-col :span="24">
            <a-card :title="$t('system:About Casdoor')" class="info-card about-card">
              <p>{{ $t("system:An Identity and Access Management (IAM) / Single-Sign-On (SSO) platform with web UI supporting OAuth 2.0, OIDC, SAML and CAS") }}</p>
              <div class="version-info">
                <strong>{{ $t("general:Version") }}: </strong>
                <span>{{ versionText }}</span>
                <a v-if="versionLink" :href="versionLink" target="_blank" rel="noreferrer" class="release-link">
                  Release Notes
                </a>
              </div>
              <div class="links">
                GitHub: <a href="https://github.com/casdoor/casdoor" target="_blank">Casdoor</a>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import PageHeader from "@/components/common/PageHeader.vue";
import * as SystemApi from "@/api/modules/system";
import { showMessage } from "@/utils/management";

const { t } = useI18n();

interface SystemInfo {
  cpuUsage: number[];
  memoryUsed: number;
  memoryTotal: number;
}

interface VersionInfo {
  version: string;
  commitOffset: number;
}

const loading = ref(true);
const systemInfo = ref<SystemInfo>({
  cpuUsage: [] as number[],
  memoryUsed: 0,
  memoryTotal: 0,
});
const versionInfo = ref<VersionInfo>({
  version: "",
  commitOffset: 0,
});

let timer: number | null = null;

const versionText = computed(() => {
  if (!versionInfo.value.version) return t("system:Unknown version");
  let text = versionInfo.value.version;
  if (versionInfo.value.commitOffset > 0) {
    text += ` (ahead+${versionInfo.value.commitOffset})`;
  }
  return text;
});

const versionLink = computed(() => {
  if (!versionInfo.value.version) return "";
  return `https://github.com/casdoor/casdoor/releases/tag/${versionInfo.value.version}`;
});

async function fetchData() {
  try {
    const [sysRes, verRes] = await Promise.all([
      SystemApi.getSystemInfo(),
      SystemApi.getVersionInfo(),
    ]);

    if (sysRes.status === "ok") {
      systemInfo.value = sysRes.data as SystemInfo;
    }
    if (verRes.status === "ok") {
      versionInfo.value = verRes.data as VersionInfo;
    }
  } catch (error) {
    showMessage("error", t("general:Failed to get") + ": " + (error as Error).message);
  } finally {
    loading.value = false;
  }
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

onMounted(() => {
  void fetchData();
  timer = window.setInterval(() => {
    void SystemApi.getSystemInfo().then(res => {
      if (res.status === "ok") {
        systemInfo.value = res.data as SystemInfo;
      }
    });
  }, 3000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.system-info-container {
  padding: 0;
}
.content-wrapper {
  padding: 24px;
}
.info-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.progress-item {
  margin-bottom: 12px;
}
.progress-item .label {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}
.memory-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}
.memory-text {
  margin-bottom: 20px;
  font-weight: 500;
  font-size: 16px;
}
.about-card p {
  line-height: 1.6;
  color: #595959;
}
.version-info, .links {
  margin-top: 12px;
}
.release-link {
  margin-left: 12px;
  font-size: 12px;
}
</style>