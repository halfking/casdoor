<template>
  <div class="position-edit-container">
    <PageHeader :title="isEdit ? $t('general.Edit') : $t('general.Add')">
      <a-button @click="handleCancel">
        {{ $t("general.Cancel") }}
      </a-button>
    </PageHeader>

    <a-spin v-if="loading" tip="Loading..." />

    <a-form
      v-else
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
      layout="horizontal"
      class="position-form"
    >
      <a-form-item :label="$t('position.Role Owner')" name="roleOwner">
        <a-input v-model:value="form.roleOwner" placeholder="kaixuan" />
      </a-form-item>

      <a-form-item :label="$t('position.Role Name')" name="roleName">
        <a-input v-model:value="form.roleName" placeholder="英文标识，唯一" :disabled="isEdit" />
      </a-form-item>

      <a-form-item :label="$t('position.Code')" name="code">
        <a-input v-model:value="form.code" placeholder="岗位编码，用于与 Post.code 匹配" />
      </a-form-item>

      <a-form-item :label="$t('position.Department')" name="department">
        <a-select
          v-model:value="form.department"
          placeholder="请选择部门"
          :options="departmentOptions"
        />
      </a-form-item>

      <a-form-item :label="$t('position.Full Description')" name="fullDescription">
        <a-textarea
          v-model:value="form.fullDescription"
          placeholder="完整描述"
          :rows="3"
        />
      </a-form-item>

      <a-form-item :label="$t('position.System Prompt')" name="systemPrompt">
        <a-textarea
          v-model:value="form.systemPrompt"
          placeholder="系统提示词"
          :rows="6"
        />
      </a-form-item>

      <a-form-item :label="$t('position.Requirements')" name="requirements">
        <a-textarea
          v-model:value="form.requirements"
          placeholder="任职要求"
          :rows="4"
        />
      </a-form-item>

      <a-form-item :label="$t('position.Skills')" name="skills">
        <a-textarea
          v-model:value="form.skills"
          placeholder="技能要求"
          :rows="3"
        />
      </a-form-item>

      <a-form-item :label="$t('position.Reports To')" name="reportsTo">
        <a-input v-model:value="form.reportsTo" placeholder="汇报对象（可选）" />
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 4, span: 18 }">
        <a-space>
          <a-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ $t("general.Confirm") }}
          </a-button>
          <a-button @click="handleCancel">
            {{ $t("general.Cancel") }}
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import type { FormInstance, Rule } from "ant-design-vue/es/form";
import PageHeader from "@/components/common/PageHeader.vue";
import * as PositionApi from "@/api/modules/position";
import type { PositionPayload } from "@/api/modules/position";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const formRef = ref<FormInstance>();
const loading = ref(false);
const submitting = ref(false);

const positionId = computed(() => {
  const rawId = route.params.id;
  if (Array.isArray(rawId)) {
    return rawId[0] || "";
  }
  return typeof rawId === "string" ? rawId : "";
});

const isEdit = computed(() => positionId.value !== "" && positionId.value !== "new");

const form = reactive<PositionPayload>({
  roleOwner: "kaixuan",
  roleName: "",
  code: "",
  fullDescription: "",
  department: undefined as string | undefined,
  systemPrompt: "",
  requirements: "",
  skills: "",
  reportsTo: "",
});

const departmentOptions = [
  { label: "技术研发部", value: "技术研发部" },
  { label: "业务运营部", value: "业务运营部" },
  { label: "平台治理部", value: "平台治理部" },
];

const rules: Record<string, Rule[]> = {
  roleName: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
  ],
  department: [
    { required: true, message: "请选择部门", trigger: "change" },
  ],
};

const fetchPosition = async (id: string) => {
  loading.value = true;
  try {
    const res = await PositionApi.getPosition(id);
    if (res.status === "ok" && res.data) {
      const data = res.data;
      Object.assign(form, {
        roleOwner: data.roleOwner || "kaixuan",
        roleName: data.roleName || "",
        code: data.code || "",
        fullDescription: data.fullDescription || "",
        department: data.department,
        systemPrompt: data.systemPrompt || "",
        requirements: data.requirements || "",
        skills: data.skills || "",
        reportsTo: data.reportsTo || "",
      });
    }
  } catch (error) {
    message.error(t("general.Failed to load position"));
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    if (isEdit.value) {
      await PositionApi.updatePosition({ ...form, id: positionId.value });
    } else {
      await PositionApi.addPosition(form);
    }
    message.success(t("general.Success"));
    void router.push("/management/positions");
  } catch (error) {
    message.error(isEdit.value ? t("general.Failed to update") : t("general.Failed to add"));
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  void router.push("/management/positions");
};

onMounted(() => {
  if (isEdit.value) {
    void fetchPosition(positionId.value);
  }
});
</script>

<style scoped lang="less">
.position-edit-container {
  padding: 24px;
  background: var(--kx-bg-card, #fff);
  border-radius: 8px;
}

.position-form {
  max-width: 800px;
  margin-top: 24px;
}
</style>
