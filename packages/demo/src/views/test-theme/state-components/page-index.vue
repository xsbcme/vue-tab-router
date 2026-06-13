<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="状态组件测试">
    <a-space direction="vertical" fill>
      <a-alert type="info">验证内置状态组件和渲染配置覆盖。</a-alert>

      <a-divider orientation="left">内置默认状态</a-divider>
      <div class="state-grid">
        <section v-for="item in defaultStates" :key="item.title" class="state-panel">
          <header class="state-panel__header">
            <strong>{{ item.title }}</strong>
            <span>{{ item.config }}</span>
          </header>
          <div class="state-panel__body">
            <component :is="item.component" />
          </div>
        </section>
      </div>

      <a-divider orientation="left">自定义状态预览</a-divider>
      <a-space direction="vertical" fill>
        <a-radio-group v-model="customState" type="button">
          <a-radio value="loading">加载中</a-radio>
          <a-radio value="error">加载失败</a-radio>
          <a-radio value="empty">无激活页</a-radio>
          <a-radio value="notFound">页面不存在</a-radio>
        </a-radio-group>
        <div class="state-preview">
          <component :is="customStateComponent" />
        </div>
      </a-space>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from "vue";
import {
  DefaultEmptyComponent,
  DefaultErrorComponent,
  DefaultLoadingComponent,
  DefaultNotFoundComponent,
  defineTabOptions,
} from "@xsbcme/vue-tab-router";

const customState = ref("loading");

const defaultStates = [
  { title: "加载中", config: "render.loadingComponent / iframe.loadingComponent", component: DefaultLoadingComponent },
  { title: "加载失败", config: "render.errorComponent", component: DefaultErrorComponent },
  { title: "无激活页", config: "render.noActiveComponent", component: DefaultEmptyComponent },
  { title: "页面不存在", config: "render.noExistComponent", component: DefaultNotFoundComponent },
];

const CustomStateComponent = defineComponent({
  props: {
    label: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => h("div", { class: "custom-state" }, [h("span", { class: "custom-state__mark" }), h("span", props.label)]);
  },
});

const customStateComponent = computed(() => {
  const labels: Record<string, string> = {
    loading: "业务加载中",
    error: "业务加载失败",
    empty: "请选择一个工作项",
    notFound: "页面配置不存在",
  };

  return h(CustomStateComponent, { label: labels[customState.value] });
});

defineTabOptions({
  viewName: "状态组件",
  viewIcon: "IconApps",
});
</script>

<style scoped lang="scss">
.state-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.state-panel {
  border: 1px solid var(--tab-color-border, #e5e6eb);
  border-radius: var(--tab-radius-md, 6px);
  overflow: hidden;
  background: var(--tab-color-bg-base, #fff);
}

.state-panel__header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--tab-color-border, #e5e6eb);
  background: var(--tab-color-bg-hover, #f2f3f5);

  strong {
    color: var(--tab-color-text-primary, #1d2129);
    font-size: 14px;
    font-weight: 500;
  }

  span {
    color: var(--tab-color-text-disabled, #86909c);
    font-size: 12px;
  }
}

.state-panel__body,
.state-preview {
  height: 150px;
  min-height: 150px;
}

.state-preview {
  border: 1px solid var(--tab-color-border, #e5e6eb);
  border-radius: var(--tab-radius-md, 6px);
  overflow: hidden;
}

.custom-state {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--tab-color-text-secondary, #4e5969);
  background: var(--tab-color-bg-base, #fff);
  font-size: 14px;
}

.custom-state__mark {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--tab-color-primary, #165dff);
  box-shadow: 0 0 0 4px rgba(22, 93, 255, 0.12);
}
</style>
