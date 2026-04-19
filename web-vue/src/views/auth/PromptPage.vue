<template>
  <div v-if="!application" />

  <a-result
    v-else-if="steps !== null && steps.length === 0"
    status="error"
    :title="t('application:Sign Up Error')"
    :sub-title="t('application:You are unexpected to see this prompt page')"
    style="display: flex; flex: 1 1 0%; justify-content: center; flex-direction: column"
  >
    <template #extra>
      <a-button type="primary" @click="redirectToLoginPage(application, router)">
        {{ t('login:Sign In') }}
      </a-button>
    </template>
  </a-result>

  <div v-else style="display: flex; flex: 1; justify-content: center">
    <a-card
      v-if="steps && steps.length > 0"
      :title="steps[current].title"
      style="margin-top: 20px; margin-bottom: 20px"
    >
      <!-- Affiliation -->
      <AffiliationSelect
        v-if="isAffiliationPrompted(application)"
        :application="application"
        :user="user"
        @update-field="updateUserField"
      />

      <!-- Prompted providers -->
      <template v-if="application && user">
        <OAuthWidget
          v-for="providerItem in promptedProviders"
          :key="providerItem.name"
          :label-span="6"
          :user="user"
          :application="application"
          :provider-item="providerItem"
          :account="account"
          @unlinked="reloadUser"
        />
      </template>

      <!-- Country/Region signup items -->
      <template v-if="application && user">
        <a-row
          v-for="item in promptedCountryItems"
          :key="item.name"
          style="margin-top: 20px; justify-content: space-between"
        >
          <a-col style="margin-top: 5px">
            <span style="margin-left: 5px">{{ t('user:Country/Region') }}:</span>
          </a-col>
          <a-col>
            <RegionSelect
              :default-value="(user as any).region"
              @change="(val: string) => updateUserFieldLocal('region', val)"
            />
          </a-col>
        </a-row>
      </template>

      <!-- Submit -->
      <div style="display: flex; align-items: center; flex-direction: column">
        <a-button
          type="primary"
          size="large"
          style="margin-top: 50px; width: 200px"
          :disabled="!isPromptAnswered(user, application)"
          @click="submitUserEdit(true)"
        >
          {{ t('code:Submit and complete') }}
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { Application, User, ProviderItem } from '../../api/types';
import { getApplication } from '../../api/modules/application';
import { getUser, updateUser } from '../../api/modules/user';
import { logout } from '../../api/modules/auth';
import {
  showMessage,
  redirectToLoginPage,
  goToLink,
  isAffiliationPrompted,
  isProviderPrompted,
  isSignupItemPrompted,
  isPromptAnswered,
  hasPromptPage,
} from '../../utils/Setting';
import AffiliationSelect from '../../components/AffiliationSelect.vue';
import OAuthWidget from '../../components/OAuthWidget.vue';
import RegionSelect from '../../components/RegionSelect.vue';

interface PromptStep {
  name: string;
  title: string;
}

const props = defineProps<{
  account: User | null;
  application?: Application | null;
  applicationName?: string;
  onUpdateAccount?: (account: User | null) => void;
  onUpdateApplication?: (app: Application) => void;
}>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const appName = computed(
  () => props.applicationName ?? (route.params.applicationName as string) ?? null
);
const localApplication = ref<Application | null>(null);
const application = computed(() => props.application ?? localApplication.value);
const user = ref<User | null>(null);
const steps = ref<PromptStep[] | null>(null);
const current = ref(0);
const finished = ref(false);
const account = computed(() => props.account);

const promptedProviders = computed(() =>
  application.value?.providers?.filter((p: ProviderItem) => isProviderPrompted(p)) ?? []
);

const promptedCountryItems = computed(() =>
  application.value?.signupItems
    ?.filter((s: any) => isSignupItemPrompted(s) && s.name === 'Country/Region') ?? []
);

function initSteps(u: User, app: Application) {
  const s: PromptStep[] = [];
  if (hasPromptPage(app)) {
    s.push({ name: 'provider', title: t('application:Binding providers') });
  }
  steps.value = s;
}

async function reloadUser() {
  if (!props.account) return;
  try {
    const res = await getUser(props.account.owner, props.account.name);
    if (res.status === 'error') {
      showMessage('error', res.msg);
      return;
    }
    user.value = res.data;
  } catch { /* ignore */ }
}

async function loadApplication() {
  if (!appName.value) return;
  try {
    const res = await getApplication('admin', appName.value);
    if (res.status === 'error') {
      showMessage('error', res.msg);
      return;
    }
    localApplication.value = res.data;
    props.onUpdateApplication?.(res.data);
  } catch { /* ignore */ }
}

function updateUserField(key: string, value: any) {
  if (!user.value) return;
  (user.value as any)[key] = value;
  submitUserEdit(false);
}

function updateUserFieldLocal(key: string, value: any) {
  if (!user.value) return;
  (user.value as any)[key] = value;
}

function getRedirectUrl(): string {
  const params = new URLSearchParams(route.query as any);
  const redirectUri = params.get('redirectUri');
  const code = params.get('code');
  const state = params.get('state');
  const oauth = params.get('oauth');
  if (!redirectUri || !code || !state) {
    const signInUrl = sessionStorage.getItem('signinUrl');
    return oauth === 'true' ? (signInUrl ?? '') : '';
  }
  return `${redirectUri}?code=${code}&state=${state}`;
}

function finishAndJump() {
  finished.value = true;
  const redirectUrl = getRedirectUrl();
  if (redirectUrl) {
    goToLink(redirectUrl);
  } else {
    redirectToLoginPage(application.value, router);
  }
}

async function submitUserEdit(isFinal: boolean) {
  if (!user.value) return;
  try {
    const copy = JSON.parse(JSON.stringify(user.value));
    const res = await updateUser(user.value.owner, user.value.name, copy);
    if (res.status === 'ok') {
      if (isFinal) {
        showMessage('success', t('general:Successfully saved'));
        finishAndJump();
      }
    } else if (isFinal) {
      showMessage('error', res.msg);
    }
  } catch (err: any) {
    if (isFinal) {
      showMessage('error', `${t('general:Failed to connect to server')}: ${err}`);
    }
  }
}

// Init
watch(
  [user, application],
  ([u, app]) => {
    if (u && app && steps.value === null) {
      initSteps(u, app);
    }
  },
  { immediate: true }
);

onMounted(() => {
  reloadUser();
  if (!props.application) {
    loadApplication();
  }
});
</script>
