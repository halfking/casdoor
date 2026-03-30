<template>
  <!-- noModal / inline mode -->
  <template v-if="noModal">
    <template v-if="captchaType === 'Default'">
      <a-row :gutter="10" style="text-align: center">
        <a-col style="flex: 70%">
          <a-input
            :value="captchaToken"
            :placeholder="t('general:Captcha')"
            @update:value="onTokenChange"
          >
            <template #prefix><SafetyOutlined /></template>
          </a-input>
        </a-col>
        <a-col style="flex: 30%">
          <img
            :src="`data:image/png;base64,${captchaImg}`"
            alt="captcha"
            style="border-radius: 5px; border: 1px solid #ccc; margin-bottom: 20px; width: 100%; cursor: pointer"
            @click="loadCaptcha"
          />
        </a-col>
      </a-row>
    </template>
    <CaptchaWidget
      v-else-if="captchaType !== 'none'"
      :captcha-type="captchaType"
      :sub-type="subType"
      :site-key="clientId"
      :client-secret="clientSecret"
      :client-id2="clientId2"
      :client-secret2="clientSecret2"
      @change="onTokenChange"
    />
  </template>

  <!-- Modal mode -->
  <a-modal
    v-else
    :open="open"
    :title="t('general:Captcha')"
    :closable="true"
    :mask-closable="false"
    :destroy-on-close="true"
    :width="350"
    :ok-text="t('general:OK')"
    :cancel-text="t('general:Cancel')"
    :footer="captchaType === 'Default' ? undefined : null"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <!-- override footer for Default captcha -->
    <template v-if="captchaType === 'Default'" #footer>
      <a-button type="primary" :disabled="!/^\d{5}$/.test(captchaToken)" @click="handleOk">
        {{ t("general:OK") }}
      </a-button>
    </template>
    <div style="margin-top: 20px; margin-bottom: 50px">
      <template v-if="captchaType === 'Default'">
        <a-col style="text-align: center">
          <div style="display: inline-block">
            <a-row
              :style="{
                backgroundImage: `url('data:image/png;base64,${captchaImg}')`,
                backgroundRepeat: 'no-repeat',
                height: '80px',
                width: '200px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginBottom: '20px',
                cursor: 'pointer',
              }"
              @click="loadCaptcha"
            />
            <a-row>
              <a-input
                v-model:value="captchaToken"
                style="width: 200px"
                :placeholder="t('general:Captcha')"
                @press-enter="handleOk"
              >
                <template #prefix><SafetyOutlined /></template>
              </a-input>
            </a-row>
          </div>
        </a-col>
      </template>
      <template v-else>
        <a-col>
          <a-row justify="center">
            <CaptchaWidget
              :captcha-type="captchaType"
              :sub-type="subType"
              :site-key="clientId"
              :client-secret="clientSecret"
              :client-id2="clientId2"
              :client-secret2="clientSecret2"
              @change="onTokenChange"
            />
          </a-row>
        </a-col>
      </template>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { SafetyOutlined } from "@ant-design/icons-vue";
import { getCaptcha } from "@/api/modules/user";
import CaptchaWidget from "./CaptchaWidget.vue";

const props = defineProps<{
  owner: string;
  name: string;
  visible: boolean;
  isCurrentProvider: boolean;
  noModal?: boolean;
}>();

const emit = defineEmits<{
  ok: [captchaType: string, captchaToken: string, clientSecret: string];
  cancel: [];
  updateToken: [captchaType: string, captchaToken: string, clientSecret: string];
}>();

const { t } = useI18n();

const captchaType = ref("none");
const clientId = ref("");
const clientSecret = ref("");
const subType = ref("");
const clientId2 = ref("");
const clientSecret2 = ref("");
const open = ref(false);
const captchaImg = ref("");
const captchaToken = ref("");

function handleOk() {
  emit("ok", captchaType.value, captchaToken.value, clientSecret.value);
}

function handleCancel() {
  captchaToken.value = "";
  emit("cancel");
}

function onTokenChange(token: string) {
  captchaToken.value = token;
  if (props.noModal) {
    emit("updateToken", captchaType.value, token, clientSecret.value);
  }
}

async function loadCaptcha() {
  const res = await getCaptcha(props.owner, props.name, props.isCurrentProvider);
  if (res.type === "none") {
    handleOk();
  } else if (res.type === "Default") {
    open.value = true;
    clientSecret.value = res.captchaId;
    captchaImg.value = res.captchaImage;
    captchaType.value = "Default";
  } else {
    open.value = true;
    captchaType.value = res.type;
    clientId.value = res.clientId;
    clientSecret.value = res.clientSecret;
    subType.value = res.subType;
    clientId2.value = res.clientId2;
    clientSecret2.value = res.clientSecret2;
  }
}

// auto-submit for non-Default widget captcha
watch(captchaToken, (val) => {
  if (val && captchaType.value !== "Default" && !props.noModal) {
    handleOk();
  }
});

watch(
  () => props.visible,
  (val) => {
    if (val || props.noModal) {
      loadCaptcha();
    } else {
      handleCancel();
      open.value = false;
    }
  }
);

defineExpose({ loadCaptcha });
</script>
