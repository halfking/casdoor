<template>
  <div class="app-logo">
    <a :href="orgUrl" target="_blank" rel="noreferrer" class="app-logo-link">
      <span class="app-logo-icon-shell" aria-hidden="true">
        <img :src="iconUrl" alt="" class="app-logo-icon" />
      </span>
      <span class="app-logo-title">开轩启圭</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Application } from "@/api/types";

const props = defineProps<{
  application: Application | null;
}>();

const appKey = computed(() => {
  const name = String(props.application?.name || "").toLowerCase();
  const homepageUrl = String(props.application?.homepageUrl || "").toLowerCase();
  const displayName = String(props.application?.displayName || "").toLowerCase();
  const haystack = `${name} ${homepageUrl} ${displayName}`;

  if (haystack.includes("acc")) return "acc";
  if (haystack.includes("stock") || haystack.includes("quant")) return "stock";
  if (haystack.includes("memora") || haystack.includes("kxmemory") || haystack.includes("memory")) return "memora";
  if (haystack.includes("doc") || haystack.includes("docs") || haystack.includes("docconv")) return "docs";
  if (haystack.includes("auth") || haystack.includes("casdoor")) return "auth";
  return "platform";
});

const iconUrl = computed(() => {
  switch (appKey.value) {
  case "acc":
    return "/assets/icon-acc.svg";
  case "stock":
    return "/assets/icon-radar.svg";
  case "memora":
    return "/assets/icon-memora.svg";
  case "docs":
    return "/assets/icon-docconv.svg";
  case "auth":
    return "/assets/icon-auth.svg";
  default:
    return "/assets/logo-icon.svg";
  }
});

const orgUrl = computed(() => {
  if (!props.application?.homepageUrl) return "/";
  return props.application.homepageUrl;
});
</script>

<style scoped>
.app-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.app-logo-link {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
}

.app-logo-icon-shell {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
}

.app-logo-icon {
  width: 100%;
  height: 100%;
  display: block;
}

.app-logo-title {
  color: #111827;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
}

:global(.login-panel-dark) .app-logo-title {
  color: #f8fafc;
}

@media (max-width: 640px) {
  .app-logo-link {
    gap: 10px;
  }

  .app-logo-icon-shell {
    width: 42px;
    height: 42px;
  }

  .app-logo-title {
    font-size: 1.5rem;
  }
}
</style>
