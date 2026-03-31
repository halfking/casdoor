import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as Conf from "../Conf";
import type { CasdoorThemeData } from "../styles/antd-theme";

export interface Account {
  owner: string;
  name: string;
  displayName?: string;
  avatar?: string;
  type?: string;
  isAdmin?: boolean;
  isGlobalAdmin?: boolean;
  organization?: {
    name: string;
    navItems?: string[];
    userNavItems?: string[];
    themeData?: CasdoorThemeData;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const useAuthStore = defineStore("auth", () => {
  const account = ref<Account | null>(null);
  const accessToken = ref<string | null>(null);

  const isAuthenticated = computed(() => account.value != null);
  const isAdmin = computed(
    () => account.value?.isAdmin === true || account.value?.isGlobalAdmin === true
  );

  function setAccount(acc: Account | null) {
    account.value = acc;
  }

  function setAccessToken(token: string | null) {
    accessToken.value = token;
  }

  function logout() {
    account.value = null;
    accessToken.value = null;
  }

  return {
    account,
    accessToken,
    isAuthenticated,
    isAdmin,
    setAccount,
    setAccessToken,
    logout,
  };
});
