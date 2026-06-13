<template>
  <div class="account-login">
    <div class="account-login-header">
      <div class="account-login-title">打开演示工作台</div>
      <div class="account-login-subtitle">先经过 Vue Router 登录鉴权，再进入多标签页工作台</div>
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

    <div class="account-login-flow" aria-label="登录流程">
      <div v-for="flow in loginFlow" :key="flow.title" class="account-login-flow-item">
        <div class="account-login-flow-index">{{ flow.index }}</div>
        <div>
          <div class="account-login-flow-title">{{ flow.title }}</div>
          <div class="account-login-flow-desc">{{ flow.desc }}</div>
        </div>
      </div>
    </div>

    <div class="account-login-guide">
      <div class="account-login-guide-title">进入后可以重点看</div>
      <div class="account-login-guide-tags">
        <span v-for="tag in guideTags" :key="tag">{{ tag }}</span>
      </div>
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
const loginFlow = [
  { index: "01", title: "Vue Router 守卫", desc: "未登录时拦截到登录页并保留 redirect" },
  { index: "02", title: "初始化首页 Tab", desc: "登录成功后写入用户态并打开首页标签" },
  { index: "03", title: "进入工作台路由", desc: "跳转 dashboard 后由 VueTabRouter 承载业务页面" },
];
const guideTags = ["菜单联动", "页面缓存", "关闭守卫", "iframe 通信"];
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
  display: flex;
  flex-direction: column;
  min-height: 520px;

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

  &-flow {
    display: grid;
    gap: 12px;
    margin-top: 28px;
    padding: 14px;
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    background: #f7f9fc;
  }

  &-flow-item {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 10px;
    align-items: flex-start;
  }

  &-flow-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 24px;
    color: #165dff;
    border-radius: 6px;
    background: rgba(22, 93, 255, 0.1);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
  }

  &-flow-title {
    color: #1d2129;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.35;
  }

  &-flow-desc {
    margin-top: 4px;
    color: #86909c;
    font-size: 12px;
    line-height: 1.5;
  }

  &-guide {
    margin-top: auto;
    padding-top: 22px;
  }

  &-guide-title {
    color: #4e5969;
    font-size: 13px;
    font-weight: 600;
  }

  &-guide-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;

    span {
      display: inline-flex;
      align-items: center;
      height: 26px;
      padding: 0 10px;
      color: #4e5969;
      border: 1px solid var(--color-border-2);
      border-radius: 6px;
      background: #fff;
      font-size: 12px;
      white-space: nowrap;
    }
  }
}

@media (max-width: 520px) {
  .account-login {
    min-height: auto;

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

    &-flow {
      margin-top: 22px;
    }

    &-guide {
      padding-top: 18px;
    }
  }
}
</style>
