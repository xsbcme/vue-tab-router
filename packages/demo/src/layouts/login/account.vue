<template>
  <div class="account-login">
    <div class="account-login-header">
      <div class="account-login-title">打开演示工作台</div>
      <div class="account-login-subtitle">使用预置账号进入插件能力示例</div>
    </div>

    <a-form
      ref="formRef"
      :label-col-props="{ span: 0 }"
      :wrapper-col-props="{ span: 24 }"
      :model="loginState"
      :rules="rules"
      class="account-login-form"
    >
      <a-form-item field="username">
        <a-input v-model="loginState.username" type="text" placeholder="演示账号" allow-clear size="large">
          <template #prefix>
            <IconUser />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item field="password">
        <a-input v-model="loginState.password" type="password" placeholder="演示密码" allow-clear size="large">
          <template #prefix>
            <IconLock />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item field="validCode">
        <div class="account-login-code">
          <a-input v-model="loginState.validCode" placeholder="验证码可留空" allow-clear size="large">
            <template #prefix>
              <IconVideoCamera />
            </template>
          </a-input>
          <a-image
            class="account-login-captcha"
            width="96px"
            height="36px"
            :src="FallbackCaptchaPng"
            :preview="false"
          />
        </div>
      </a-form-item>
      <a-button type="primary" block size="large" @click="handleLogin">
        <template #icon>
          <IconLaunch />
        </template>
        进入工作台
      </a-button>
    </a-form>

    <div class="account-login-meta">
      <span>默认账号：{{ loginState.username }}</span>
      <span>默认密码：{{ loginState.password }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, shallowRef } from "vue";
import { useRoute } from "vue-router";
import { FieldRule, FormInstance } from "@arco-design/web-vue";
import { IconLaunch, IconVideoCamera, IconLock, IconUser } from "@arco-design/web-vue/es/icon";

import FallbackCaptchaPng from "@/assets/images/check_code.png";
import { useUserStore } from "@/plugins/store";

const loginState = reactive({
  username: "xsbcme",
  password: "666",
  validCode: "",
  validCodeKey: "",
});

const userStore = useUserStore();
const route = useRoute();
const formRef = shallowRef<FormInstance>();
const rules: Record<string, FieldRule[]> = {
  username: [{ required: true, message: "请输入登录账号" }],
  password: [{ required: true, message: "请输入登录密码" }],
  validCode: [{ required: false, message: "请输入登录验证码" }],
};

const handleLogin = () => {
  formRef.value!.validate(err => {
    if (!err) {
      const redirect = typeof route.query.redirect === "string" ? route.query.redirect : undefined;
      userStore.login(loginState.username, loginState.password, redirect);
    }
  });
};
</script>

<style lang="scss" scoped>
.account-login {
  width: 100%;

  &-header {
    margin-bottom: 22px;
  }

  &-title {
    color: #1d2129;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.25;
  }

  &-subtitle {
    margin-top: 8px;
    color: #86909c;
    font-size: 14px;
  }

  &-form {
    :deep(.arco-form-item) {
      margin-bottom: 18px;
    }

    :deep(.arco-input-wrapper) {
      border-radius: 6px;
    }
  }

  &-code {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 96px;
    gap: 10px;
    width: 100%;
  }

  &-captcha {
    border: 1px solid var(--color-border-2);
    border-radius: 6px;
    cursor: pointer;
    overflow: hidden;
    background: #f7f8fa;
  }

  &-meta {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 18px;
    color: #86909c;
    font-size: 12px;
  }
}

@media (max-width: 520px) {
  .account-login {
    &-title {
      font-size: 22px;
    }

    &-code {
      grid-template-columns: 1fr;
    }

    &-captcha {
      width: 100% !important;
    }

    &-meta {
      flex-direction: column;
      gap: 4px;
    }
  }
}
</style>
