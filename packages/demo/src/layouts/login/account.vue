<template>
  <a-form
    ref="formRef"
    :label-col-props="{ span: 0 }"
    :wrapper-col-props="{ span: 24 }"
    :model="loginState"
    :rules="rules"
    :style="{ padding: '0 8px 8px 8px' }"
  >
    <a-form-item field="username">
      <a-input v-model="loginState.username" type="text" placeholder="请输入登录账号" allow-clear size="large">
        <template #prefix>
          <IconUser />
        </template>
      </a-input>
    </a-form-item>
    <a-form-item field="password">
      <a-input v-model="loginState.password" type="password" placeholder="请输入登录密码" allow-clear size="large">
        <template #prefix>
          <IconLock />
        </template>
      </a-input>
    </a-form-item>
    <a-form-item field="validCode">
      <a-row :style="{ width: '100%' }" justify="space-between">
        <a-col :span="15">
          <a-input v-model="loginState.validCode" placeholder="请输入登录验证码" allowClear size="large">
            <template #prefix>
              <IconVideoCamera />
            </template>
          </a-input>
        </a-col>
        <a-col :span="8">
          <a-image
            :style="{ border: '1px solid var(--color-border-1)', cursor: 'pointer', overflow: 'hidden' }"
            width="100%"
            height="35px"
            :src="FallbackCaptchaPng"
            :preview="false"
          />
        </a-col>
      </a-row>
    </a-form-item>
    <a-button type="primary" block size="large" @click="handleLogin">登录</a-button>
  </a-form>
</template>
<script lang="ts" setup>
import { reactive, shallowRef } from "vue";
import { FieldRule, FormInstance } from "@arco-design/web-vue";
import { IconVideoCamera, IconLock, IconUser } from "@arco-design/web-vue/es/icon";

import FallbackCaptchaPng from "@/assets/images/check_code.png";
import { useUserStore } from "@/plugins/store";

const loginState = reactive({
  username: "xsbcme",
  password: "666",
  validCode: "",
  validCodeKey: "",
});

const userStore = useUserStore();
const formRef = shallowRef<FormInstance>();
const rules: Record<string, FieldRule[]> = {
  username: [{ required: true, message: "请输入登录账号" }],
  password: [{ required: true, message: "请输入登录密码" }],
  validCode: [{ required: false, message: "请输入登录验证码" }],
};

const handleLogin = () => {
  formRef.value!.validate(err => {
    if (!err) {
      userStore.login(loginState.username, loginState.password);
    }
  });
};
</script>
<style lang="scss" scoped></style>
