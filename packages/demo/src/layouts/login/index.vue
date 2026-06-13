<template>
  <div class="login">
    <div class="login-shell">
      <section class="login-intro" aria-label="VueTabRouter 插件能力">
        <div class="login-brand">
          <div class="login-brand-icon">
            <IconApps />
          </div>
          <div>
            <div class="login-brand-name">{{ systemTitle }}</div>
            <div class="login-brand-desc">多标签页路由工作台插件</div>
          </div>
        </div>

        <div class="login-hero">
          <div class="login-eyebrow">Vue 3 / TypeScript / Workbench</div>
          <h1>进入可交互的多标签工作台演示</h1>
          <p>体验组件页、iframe 页、缓存控制、关闭守卫、菜单联动和页面通信如何在同一套 TabsManager 中协同工作。</p>
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
            <span class="is-active">首页</span>
            <span>订单中心</span>
            <span>iframe 看板</span>
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

      <div class="login-panel">
        <a-tabs :style="{ width: '100%' }" default-active-key="Account">
          <a-tab-pane key="Account" title="演示入口">
            <AccountComponent />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { IconApps, IconBranch, IconLink, IconSafe, IconStorage, IconThunderbolt } from "@arco-design/web-vue/es/icon";

import AccountComponent from "./account.vue";

const systemTitle = import.meta.env.VITE_SYSTEM_TITLE || "VueTabRouter";
const features = [
  { title: "多标签管理", desc: "打开、切换、复用、刷新和批量关闭", icon: IconBranch },
  { title: "缓存与守卫", desc: "页面状态保留、离开确认和关闭拦截", icon: IconSafe },
  { title: "iframe 承载", desc: "外部页面与组件页面统一进入标签模型", icon: IconLink },
  { title: "插件扩展", desc: "存储适配、事件通信和项目级 hook", icon: IconThunderbolt },
  { title: "状态持久化", desc: "刷新后恢复工作台上下文", icon: IconStorage },
];
</script>

<style lang="scss" scoped>
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
  background:
    linear-gradient(135deg, rgba(22, 93, 255, 0.1), rgba(0, 180, 154, 0.08) 45%, rgba(255, 255, 255, 0.88)), #f5f7fb;
  color: var(--login-text);

  &-shell {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 392px;
    gap: 28px;
    align-items: stretch;
    width: min(1120px, 100%);
    height: min(720px, 100%);
    min-height: 560px;
  }

  &-intro,
  &-panel {
    border: 1px solid rgba(22, 93, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 18px 48px rgba(29, 33, 41, 0.08);
  }

  &-intro {
    display: flex;
    min-width: 0;
    padding: 36px;
    overflow: hidden;
    flex-direction: column;
    justify-content: space-between;
  }

  &-brand {
    display: flex;
    align-items: center;
    gap: 12px;

    &-icon {
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

    &-name {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
    }

    &-desc {
      margin-top: 4px;
      color: var(--login-muted);
      font-size: 13px;
    }
  }

  &-hero {
    width: min(620px, 100%);
    margin-top: 42px;

    h1 {
      margin: 0;
      font-size: 42px;
      line-height: 1.16;
      font-weight: 700;
      letter-spacing: 0;
    }

    p {
      margin-top: 18px;
      color: var(--login-muted);
      font-size: 16px;
      line-height: 1.8;
    }
  }

  &-eyebrow {
    margin-bottom: 12px;
    color: var(--login-accent);
    font-size: 13px;
    font-weight: 600;
  }

  &-feature-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin: 34px 0;
  }

  &-feature-item {
    display: flex;
    gap: 12px;
    min-width: 0;
    padding: 14px;
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.74);
  }

  &-feature-icon {
    flex: 0 0 auto;
    color: var(--login-accent);
    font-size: 20px;
  }

  &-feature-title {
    font-size: 14px;
    font-weight: 600;
  }

  &-feature-desc {
    margin-top: 4px;
    color: var(--login-muted);
    font-size: 12px;
    line-height: 1.5;
  }

  &-preview {
    border: 1px solid rgba(22, 93, 255, 0.16);
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }

  &-preview-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    border-bottom: 1px solid var(--color-border-2);
    background: #f7f8fa;

    span {
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

      &.is-active {
        border-color: rgba(22, 93, 255, 0.28);
        color: var(--login-accent);
        background: var(--login-accent-weak);
      }
    }
  }

  &-preview-body {
    display: grid;
    grid-template-columns: 150px 1fr;
    min-height: 112px;
  }

  &-preview-menu {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    border-right: 1px solid var(--color-border-2);
    background: #fbfcff;

    span {
      display: block;
      height: 10px;
      border-radius: 6px;
      background: #e5e8ef;

      &:first-child {
        width: 80%;
        background: rgba(22, 93, 255, 0.22);
      }

      &:nth-child(2) {
        width: 62%;
      }

      &:nth-child(3) {
        width: 72%;
      }
    }
  }

  &-preview-content {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    padding: 16px;

    span {
      min-height: 80px;
      border-radius: 8px;
      background: linear-gradient(180deg, rgba(22, 93, 255, 0.12), rgba(0, 180, 154, 0.1));
    }
  }

  &-panel {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 0;
    padding: 28px 30px;

    :deep(.arco-tabs-nav-tab) {
      justify-content: center;
    }

    :deep(.arco-tabs-tab-title) {
      font-size: 18px;
      font-weight: 600;
    }
  }
}

@media (max-width: 920px) {
  .login {
    min-height: auto;
    overflow: auto;
    place-items: start center;
    padding: 12px;

    &-shell {
      grid-template-columns: 1fr;
      width: min(640px, 100%);
      height: auto;
      min-height: auto;
    }

    &-intro {
      padding: 24px;
    }

    &-hero {
      margin-top: 28px;

      h1 {
        font-size: 30px;
      }

      p {
        font-size: 14px;
      }
    }

    &-feature-grid {
      grid-template-columns: 1fr;
      margin: 24px 0;
    }

    &-preview-body {
      grid-template-columns: 104px 1fr;
    }

    &-preview-content {
      grid-template-columns: 1fr;

      span {
        min-height: 34px;
      }
    }

    &-panel {
      padding: 22px 18px;
    }
  }
}

@media (max-width: 520px) {
  .login {
    &-brand {
      align-items: flex-start;
    }

    &-brand-name {
      font-size: 18px;
    }

    &-hero h1 {
      font-size: 26px;
    }

    &-preview {
      display: none;
    }

    &-preview-toolbar {
      overflow-x: auto;
    }
  }
}
</style>
