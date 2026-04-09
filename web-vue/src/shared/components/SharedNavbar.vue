<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';
import * as authService from '@/shared/auth/auth-service.js';
import {
  getPortalNavCompact,
  getPortalNavLinks,
  getUnifiedProductEntries,
  getUnifiedProductEntryGroups,
  resolvePortalLoginUrl,
  resolveProductLaunchUrl,
  resolveServiceUrl,
} from '@/shared/navigation/unified-links';
import './SharedNavbar.css';

type NavLink = {
  id?: string;
  label: string;
  href: string;
  external?: boolean;
  highlight?: boolean;
  icon?: string;
};

const props = withDefaults(
  defineProps<{
    appName?: string;
    appLinks?: NavLink[];
    isAuthenticated?: boolean;
    authToken?: string | null;
    hidePortalNav?: boolean;
  }>(),
  {
    appName: undefined,
    appLinks: () => [],
    isAuthenticated: false,
    authToken: null,
    hidePortalNav: false,
  },
);

const emit = defineEmits<{
  login: [];
  logout: [];
}>();

const hasLoginListener = computed(() => {
  const instance = getCurrentInstance();
  return Boolean(instance?.vnode.props?.onLogin);
});

const MAX_TOTAL_LINKS = 8;
const PRODUCT_MENU_CLOSE_DELAY_MS = 220;
const dropdownRef = ref<HTMLElement | null>(null);
const isProductMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
const theme = ref<'daylight' | 'night'>(authService.getPreferredTheme());
const recentProducts = ref<{ key: string; name: string; timestamp: number }[]>([]);
const navConfig = ref(authService.getCustomNavConfig());
let closeMenuTimer: ReturnType<typeof setTimeout> | null = null;

const portalLinks = computed(() => {
  if (props.hidePortalNav) {
    return [];
  }
  const totalLinks = props.appLinks.length + (props.isAuthenticated ? 4 : 1);
  return totalLinks > MAX_TOTAL_LINKS ? getPortalNavCompact() : getPortalNavLinks();
});

const productEntries = computed(() => getUnifiedProductEntries());
const groupedProductEntries = computed(() => getUnifiedProductEntryGroups());

const recentVisibleProducts = computed(() => {
  return recentProducts.value
    .map((recent) => ({
      recent,
      product: productEntries.value.find((entry) => entry.id === recent.key),
    }))
    .filter(
      (item): item is { recent: { key: string; name: string; timestamp: number }; product: NavLink } =>
        Boolean(item.product),
    );
});

const themeLabel = computed(() => (theme.value === 'night' ? '切换到白昼' : '切换到暗夜'));

function normalizePath(value: string) {
  const normalized = value.replace(/\/+$/, '');
  return normalized || '/';
}

function isNavLinkActive(href: string) {
  if (typeof window === 'undefined') return false;
  try {
    const current = new URL(window.location.href);
    const target = new URL(href, window.location.origin);
    if (current.origin !== target.origin) return false;
    if (normalizePath(current.pathname) !== normalizePath(target.pathname)) return false;
    if (target.hash) return current.hash === target.hash;
    if (target.search) return current.search === target.search;
    return true;
  } catch {
    return false;
  }
}

function getProductHref(product: NavLink) {
  return resolveProductLaunchUrl(product.id || '', product.href, undefined, props.authToken) || product.href;
}

function handleThemeToggle() {
  theme.value = authService.togglePreferredTheme();
}

function handleLoginClick() {
  if (hasLoginListener.value) {
    emit('login');
  } else {
    window.location.href = resolvePortalLoginUrl();
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function clearCloseMenuTimer() {
  if (closeMenuTimer !== null) {
    clearTimeout(closeMenuTimer);
    closeMenuTimer = null;
  }
}

function openProductMenu() {
  clearCloseMenuTimer();
  isProductMenuOpen.value = true;
}

function toggleProductMenu() {
  clearCloseMenuTimer();
  isProductMenuOpen.value = !isProductMenuOpen.value;
}

function scheduleProductMenuClose() {
  clearCloseMenuTimer();
  closeMenuTimer = setTimeout(() => {
    isProductMenuOpen.value = false;
    closeMenuTimer = null;
  }, PRODUCT_MENU_CLOSE_DELAY_MS);
}

function handleOutsideClick(event: MouseEvent) {
  if (!dropdownRef.value?.contains(event.target as Node)) {
    clearCloseMenuTimer();
    isProductMenuOpen.value = false;
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    clearCloseMenuTimer();
    isProductMenuOpen.value = false;
    isMobileMenuOpen.value = false;
  }
}

function handleProductClick(product: NavLink) {
  if (product.id) {
    authService.recordProductAccess(product.id, product.label);
  }
  clearCloseMenuTimer();
  isProductMenuOpen.value = false;
}

let stopThemeSync: (() => void) | null = null;
let stopAuthEvent: (() => void) | null = null;

onMounted(() => {
  stopThemeSync = authService.setupThemeSync((nextTheme) => {
    theme.value = nextTheme;
  });

  if (props.isAuthenticated) {
    recentProducts.value = authService.getRecentProducts();
    navConfig.value = authService.getCustomNavConfig();
  }

  stopAuthEvent = authService.onAuthEvent((event: { type: string; data?: unknown }) => {
    if (event.type === 'recent_products_updated') {
      recentProducts.value = Array.isArray(event.data)
        ? (event.data as { key: string; name: string; timestamp: number }[])
        : [];
    }
    if (event.type === 'custom_nav_updated') {
      navConfig.value = authService.getCustomNavConfig();
    }
  });

  document.addEventListener('mousedown', handleOutsideClick);
  document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  stopThemeSync?.();
  stopAuthEvent?.();
  clearCloseMenuTimer();
  document.removeEventListener('mousedown', handleOutsideClick);
  document.removeEventListener('keydown', handleEscape);
});
</script>

<template>
  <header class="kx-shared-navbar">
    <nav class="kx-shared-navbar__container">
      <a class="kx-shared-navbar__logo" :href="resolveServiceUrl('portal')">
        <img src="/img/kx-brand-mark.svg" alt="开轩启圭" class="kx-shared-navbar__logo-icon" />
        <div class="kx-shared-navbar__logo-text">
          <span class="kx-brand-main">开轩启圭</span>
          <span v-if="appName" class="kx-brand-separator">·</span>
          <span v-if="appName" class="kx-brand-product">{{ appName }}</span>
          <span v-else class="kx-brand-product">数字智能</span>
        </div>
      </a>

      <button
        type="button"
        class="kx-shared-navbar__mobile-toggle"
        :aria-expanded="isMobileMenuOpen"
        aria-label="切换导航菜单"
        @click="toggleMobileMenu"
      >
        {{ isMobileMenuOpen ? '✕' : '☰' }}
      </button>

      <div :class="['kx-shared-navbar__links', isMobileMenuOpen && 'kx-shared-navbar__links--mobile-open', $slots['workspace-nav'] && 'kx-shared-navbar__links--workspace-mode']">
        <a
          v-for="link in appLinks"
          :key="link.href"
          :href="link.href"
          :class="[
            'kx-shared-navbar__link',
            link.highlight && 'kx-shared-navbar__link--highlight',
            isNavLinkActive(link.href) && 'kx-shared-navbar__link--active',
          ]"
          :aria-current="isNavLinkActive(link.href) ? 'page' : undefined"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener noreferrer' : undefined"
        >
          {{ link.label }}
        </a>

        <slot name="workspace-nav" />
        <div v-if="$slots['workspace-nav']" class="kx-shared-navbar__workspace-spacer" aria-hidden="true" />

        <span
          v-if="(appLinks.length > 0 || !!$slots['workspace-nav']) && portalLinks.length > 0"
          class="kx-shared-navbar__divider"
          aria-hidden="true"
        />

        <a
          v-for="link in portalLinks"
          :key="link.href"
          :href="link.href"
          :class="[
            'kx-shared-navbar__link',
            'kx-shared-navbar__link--portal',
            isNavLinkActive(link.href) && 'kx-shared-navbar__link--active',
          ]"
          :aria-current="isNavLinkActive(link.href) ? 'page' : undefined"
        >
          {{ link.label }}
        </a>

        <div
          ref="dropdownRef"
          class="kx-shared-navbar__dropdown"
          @mouseenter="openProductMenu"
          @mouseleave="scheduleProductMenuClose"
          @focusin="openProductMenu"
        >
          <button
            type="button"
            class="kx-shared-navbar__btn-link kx-shared-navbar__btn-link--dropdown"
            aria-haspopup="true"
            :aria-expanded="isProductMenuOpen"
            aria-label="打开产品导航"
            @click="toggleProductMenu"
          >
            <span class="kx-shared-navbar__dropdown-trigger-label">产品</span>
            <span :class="['kx-shared-navbar__dropdown-arrow', isProductMenuOpen && 'is-open']">▼</span>
          </button>

          <div :class="['kx-shared-navbar__dropdown-menu', isProductMenuOpen && 'kx-shared-navbar__dropdown-menu--open']">
            <template v-if="isAuthenticated && navConfig.showRecent && recentVisibleProducts.length > 0">
              <div class="kx-shared-navbar__dropdown-section">
                <div class="kx-shared-navbar__dropdown-section-title">最近使用</div>
              </div>

              <a
                v-for="item in recentVisibleProducts"
                :key="`recent-${item.recent.key}`"
                :href="getProductHref(item.product)"
                class="kx-shared-navbar__dropdown-item kx-shared-navbar__dropdown-item--recent"
                :target="item.product.external ? '_blank' : undefined"
                :rel="item.product.external ? 'noopener noreferrer' : undefined"
                @click="handleProductClick(item.product)"
              >
                <span class="kx-shared-navbar__dropdown-item-icon" aria-hidden="true">{{ item.product.icon }}</span>
                <span class="kx-shared-navbar__dropdown-item-label">{{ item.product.label }}</span>
              </a>

              <div class="kx-shared-navbar__dropdown-divider" />
            </template>

            <div v-for="group in groupedProductEntries" :key="group.groupLabel || 'default'">
              <div v-if="group.groupLabel" class="kx-shared-navbar__dropdown-section">
                <div class="kx-shared-navbar__dropdown-section-title">{{ group.groupLabel }}</div>
              </div>

              <a
                v-for="product in group.items"
                :key="product.id"
                :href="getProductHref(product)"
                class="kx-shared-navbar__dropdown-item"
                :target="product.external ? '_blank' : undefined"
                :rel="product.external ? 'noopener noreferrer' : undefined"
                @click="handleProductClick(product)"
              >
                <span class="kx-shared-navbar__dropdown-item-icon" aria-hidden="true">{{ product.icon }}</span>
                <span class="kx-shared-navbar__dropdown-item-label">{{ product.label }}</span>
              </a>
            </div>
          </div>
        </div>

        <button
          v-if="!$slots['status-actions']"
          type="button"
          class="kx-shared-navbar__btn-link kx-shared-navbar__theme-toggle"
          :aria-label="themeLabel"
          :title="themeLabel"
          @click="handleThemeToggle"
        >
          <span class="kx-shared-navbar__theme-toggle-label">{{ theme === 'night' ? '白昼' : '暗夜' }}</span>
        </button>

        <slot name="status-actions" />

        <button
          v-if="isAuthenticated"
          type="button"
          class="kx-shared-navbar__btn-link kx-shared-navbar__btn-link--danger"
          @click="emit('logout')"
        >
          退出
        </button>
        <button
          v-else
          type="button"
          class="kx-shared-navbar__link kx-shared-navbar__link--highlight kx-shared-navbar__login-btn"
          @click="handleLoginClick"
        >
          登录
        </button>
      </div>
    </nav>
  </header>
</template>