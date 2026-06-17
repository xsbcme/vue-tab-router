<template>
  <main class="login">
    <div class="login-shell">
      <section class="login-intro" aria-label="Vue Router Tab 适配层能力">
        <div class="login-brand">
          <div class="login-brand-icon"><IconApps /></div>
          <div>
            <div class="login-brand-name">Vue Router Tab</div>
            <div class="login-brand-desc">Router-first multi-tab workspace</div>
          </div>
        </div>

        <div class="login-hero">
          <div class="login-eyebrow">Vue Router / Adapter / TabsManager</div>
          <h1>从路由进入多标签工作台</h1>
          <p>
            登录页、工作区、业务路由都由 Vue Router 管理，适配层负责把路由页面同步成可复用、可关闭、可缓存的标签页。
          </p>
        </div>

        <div class="login-feature-grid">
          <div v-for="feature in features" :key="feature.title" class="login-feature-item">
            <component :is="feature.icon" class="login-feature-icon" />
            <div>
              <div class="login-feature-title">{{ feature.title }}</div>
              <div class="login-feature-desc">{{ feature.desc }}</div>
            </div>
          </div>
        </div>

        <div class="login-preview" aria-hidden="true">
          <div class="login-preview-toolbar">
            <span class="is-active">总览</span>
            <span>订单中心</span>
            <span>订单 A1024</span>
          </div>
          <div class="login-preview-body">
            <div class="login-preview-menu">
              <span />
              <span />
              <span />
            </div>
            <div class="login-preview-content">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>

      <section class="login-panel">
        <a-tabs :style="{ width: '100%' }" default-active-key="account">
          <a-tab-pane key="account" title="演示入口">
            <div class="login-form-card">
              <div class="login-form-header">
                <div class="login-form-title">打开路由标签工作台</div>
                <div class="login-form-subtitle">进入后可测试路由跳转、标签关闭和缓存同步</div>
              </div>
              <a-form class="login-form" :model="form" layout="vertical" @submit-success="enterWorkbench">
                <a-form-item field="username" label="账号">
                  <a-input v-model="form.username" autocomplete="username" size="large">
                    <template #prefix><IconUser /></template>
                  </a-input>
                </a-form-item>
                <a-form-item field="password" label="密码">
                  <a-input-password v-model="form.password" autocomplete="current-password" size="large">
                    <template #prefix><IconLock /></template>
                  </a-input-password>
                </a-form-item>
                <a-button html-type="submit" long size="large" type="primary">
                  <template #icon><IconLaunch /></template>
                  进入工作台
                </a-button>
              </a-form>
              <div class="login-form-meta">
                <span>默认账号：{{ form.username }}</span>
                <span>默认密码：{{ form.password }}</span>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import {
  IconApps,
  IconBranch,
  IconLaunch,
  IconLink,
  IconLock,
  IconStorage,
  IconSync,
  IconUser,
} from "@arco-design/web-vue/es/icon";

const router = useRouter();
const form = reactive({
  username: "admin",
  password: "vue-router-tab",
});
const features = [
  { title: "路由优先", desc: "菜单和链接先完成 vue-router 导航", icon: IconBranch },
  { title: "标签同步", desc: "路由进入、标签激活和关闭自动回写", icon: IconSync },
  { title: "参数多开", desc: "详情页按 route params 生成独立标签", icon: IconLink },
  { title: "缓存复用", desc: "沿用核心 TabsManager 的缓存和复用模型", icon: IconStorage },
];

const enterWorkbench = () => {
  router.replace("/workbench/overview");
};
</script>

<style scoped lang="scss">
.login {
  --login-accent: #165dff;
  --login-accent-weak: rgba(22, 93, 255, 0.1);
  --login-text: #1d2129;
  --login-muted: #4e5969;

  width: 100%;
  height: 100%;
  min-height: 640px;
  display: grid;
  place-items: center;
  padding: 24px;
  overflow: hidden;
  color: var(--login-text);
  background:
    linear-gradient(135deg, rgba(22, 93, 255, 0.1), rgba(0, 180, 154, 0.08) 45%, rgba(255, 255, 255, 0.88)), #f5f7fb;
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 392px;
  gap: 28px;
  align-items: stretch;
  width: min(1120px, 100%);
  height: min(720px, 100%);
  min-height: 560px;
}

.login-intro,
.login-panel {
  border: 1px solid rgba(22, 93, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 48px rgba(29, 33, 41, 0.08);
}

.login-intro {
  display: flex;
  min-width: 0;
  padding: 36px;
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: #fff;
  background: var(--login-accent);
  border-radius: 8px;
  font-size: 24px;
}

.login-brand-name {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.login-brand-desc {
  margin-top: 4px;
  color: var(--login-muted);
  font-size: 13px;
}

.login-hero {
  width: min(620px, 100%);
  margin-top: 42px;
}

.login-hero h1 {
  margin: 0;
  font-size: 42px;
  line-height: 1.16;
  font-weight: 700;
  letter-spacing: 0;
}

.login-hero p {
  margin-top: 18px;
  color: var(--login-muted);
  font-size: 16px;
  line-height: 1.8;
}

.login-eyebrow {
  margin-bottom: 12px;
  color: var(--login-accent);
  font-size: 13px;
  font-weight: 600;
}

.login-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 34px 0;
}

.login-feature-item {
  display: flex;
  gap: 12px;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.74);
}

.login-feature-icon {
  flex: 0 0 auto;
  color: var(--login-accent);
  font-size: 20px;
}

.login-feature-title {
  font-size: 14px;
  font-weight: 600;
}

.login-feature-desc {
  margin-top: 4px;
  color: var(--login-muted);
  font-size: 12px;
  line-height: 1.5;
}

.login-preview {
  border: 1px solid rgba(22, 93, 255, 0.16);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.login-preview-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid var(--color-border-2);
  background: #f7f8fa;
}

.login-preview-toolbar span {
  display: inline-flex;
  max-width: 120px;
  height: 26px;
  align-items: center;
  padding: 0 12px;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  color: var(--login-muted);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #fff;
}

.login-preview-toolbar span.is-active {
  border-color: rgba(22, 93, 255, 0.28);
  color: var(--login-accent);
  background: var(--login-accent-weak);
}

.login-preview-body {
  display: grid;
  grid-template-columns: 150px 1fr;
  min-height: 112px;
}

.login-preview-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-right: 1px solid var(--color-border-2);
  background: #fbfcff;
}

.login-preview-menu span {
  display: block;
  height: 10px;
  border-radius: 6px;
  background: #e5e8ef;
}

.login-preview-menu span:first-child {
  width: 80%;
  background: rgba(22, 93, 255, 0.22);
}

.login-preview-menu span:nth-child(2) {
  width: 62%;
}

.login-preview-menu span:nth-child(3) {
  width: 72%;
}

.login-preview-content {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 16px;
}

.login-preview-content span {
  min-height: 80px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(22, 93, 255, 0.12), rgba(0, 180, 154, 0.1));
}

.login-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  padding: 28px 30px;
}

.login-panel :deep(.arco-tabs) {
  height: 100%;
}

.login-panel :deep(.arco-tabs-content) {
  height: calc(100% - 46px);
}

.login-panel :deep(.arco-tabs-content-list),
.login-panel :deep(.arco-tabs-pane) {
  height: 100%;
}

.login-panel :deep(.arco-tabs-nav-tab) {
  justify-content: center;
}

.login-panel :deep(.arco-tabs-tab-title) {
  font-size: 18px;
  font-weight: 600;
}

.login-form-card {
  min-height: 420px;
}

.login-form {
  position: relative;
  z-index: 1;
}

.login-form-header {
  margin-bottom: 22px;
}

.login-form-title {
  color: #1d2129;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
}

.login-form-subtitle {
  margin-top: 8px;
  color: #86909c;
  font-size: 14px;
}

.login-form :deep(.arco-form-item) {
  margin-bottom: 18px;
}

.login-form :deep(.arco-input-wrapper) {
  border-radius: 6px;
}

.login-form-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 18px;
  color: #86909c;
  font-size: 12px;
}

@media (max-width: 920px) {
  .login {
    height: auto;
    min-height: 100%;
    overflow: visible;
    place-items: start center;
    padding: 12px;
  }

  .login-shell {
    grid-template-columns: 1fr;
    width: min(640px, 100%);
    height: auto;
    min-height: auto;
  }

  .login-intro {
    padding: 24px;
  }

  .login-hero {
    margin-top: 28px;
  }

  .login-hero h1 {
    font-size: 30px;
  }

  .login-hero p {
    font-size: 14px;
  }

  .login-feature-grid {
    grid-template-columns: 1fr;
    margin: 24px 0;
  }

  .login-preview-body {
    grid-template-columns: 104px 1fr;
  }

  .login-preview-content {
    grid-template-columns: 1fr;
  }

  .login-preview-content span {
    min-height: 34px;
  }

  .login-panel {
    padding: 22px 18px;
  }
}

@media (max-width: 520px) {
  .login-brand {
    align-items: flex-start;
  }

  .login-brand-name {
    font-size: 18px;
  }

  .login-hero h1 {
    font-size: 26px;
  }

  .login-preview {
    display: none;
  }

  .login-preview-toolbar {
    overflow-x: auto;
  }

  .login-form-meta {
    flex-direction: column;
  }
}
</style>
