# 快速开始

## 在线尝试
可以直接在 [Gitee](https://gitee.com/xsbcme/vue-tab-router-demo) 上下载Demo尝试。

## 安装
用你喜欢的包管理器安装：
```sh
npm  install @xsbcme/vue-tab-router
pnpm install @xsbcme/vue-tab-router
yarn install @xsbcme/vue-tab-router
```

## 示例
为了引入一些核心概念，将使用如下的示例：
首先来看页面组件 `Container.vue`。

### Container.vue
![Container.vue](/images/container.png)
```vue
<template>
    <div class="container">
        <div class="container-menus">
            <MenusComponent />
        </div>
        <div class="container-wrapper">
            <div class="container-content">
                <div class="container-tabs">
                    <TabsComponent />
                </div>
                <div class="container-render">
                    <div class="container-component">
                        <DynamicContainerComponent />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { DynamicContainerComponent } from '@xsbcme/vue-tab-router';
import MenusComponent from './menus/index.vue';
import TabsComponent from './tabs.vue';

</script>
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
    display: flex;

    &-menus {
        width: 250px;
        border-right: 1px solid #ccc;
    }

    &-wrapper {
        flex: 1;
        overflow: hidden;
    }

    &-content {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    &-tabs {
        padding: 8px;
        border-bottom: 1px solid #ccc;
    }

    &-render {
        flex: 1;
        overflow: hidden;
    }

    &-component {
        width: 100%;
        height: 100%;
        overflow: auto;
        padding: 8px;
    }
}
</style>
```

在这个 `template` 中使用了由 VueTabRouter 提供的组件: `DynamicContainerComponent`。

`DynamicContainerComponent` 组件可以使 VueTabRouter 知道你想要在哪里渲染当前 URL 路径对应的路由组件。它不一定要在 Container.vue 中，你可以把它放在任何地方，但它需要在某处被导入，否则 VueTabRouter 就不会渲染任何东西。

### 创建路由器实例
路由器实例是通过调用 `createTabsManager()` 函数创建的:

```ts
import { createTabsManager, StorageAdapter } from '@xsbcme/vue-tab-router';

/**
 * import About from '@/views/about/page-index.vue';
 * const modules = {
 *     '/src/views/home/page-index.vue': () => import('@/views/home/page-index.vue'),
 *     '/src/views/about/page-index.vue': About,
 * }
 */
const modules = import.meta.glob("@/views/**/page-index.vue", { eager: false });

const tabsManager = createTabsManager({
    modules,
    storageAdapter: new StorageAdapter(sessionStorage),
});

export default tabsManager;
```

`modules` 选项定义了一组路由，把 URL 路径映射到组件。这些路由组件通常被称为视图，但本质上它们只是普通的 Vue 组件。

`storageAdapter` 选项为插件持久化存储提供支持。内置了一个缓存适配器，适用于 WEB 环境，通常情况下此选项不需要设置，默认会以 `sessionStorage` 为默认存储，当然也可以自定义实现适配器。

其他可以设置的插件配置会在之后介绍

> [!TIP]
> 推荐使用 [Vite](https://www.vitejs.net/) 作为项目构建工具。<br/>
> 在 Vite 中，你可以使用 `import.meta.glob` 函数来动态导入路由组件，以实现基于文件的路由配置。

### 注册路由器插件
一旦创建了我们的路由器实例，我们就需要将其注册为插件，这一步骤可以通过调用 `use()` 来完成。

```ts
import { createApp } from 'vue';
import App from '@/App.vue';

import tabsManager from '@/plugins/tab-router';
const run = async () => {
    const app = createApp(App)
        .use(tabsManager);
    app.mount('#app');
}

run().catch(err => {
    console.error(err);
});
```

和大多数的 Vue 插件一样，`use()` 需要在 `mount()` 之前调用。

### 使用路由器实例
你很可能想要在应用的其他地方访问路由器。

如果你是从 ES 模块导出路由器实例的，你可以将路由器实例直接导入到你需要它的地方。在一些情况下这是最好的方法，但如果我们在组件内部，那么我们还有其他选择。

在组件模板中，路由器实例将被暴露为 `$tabsManager`。

如果我们使用选项式 API，我们可以在 JavaScript 中如下访问这属性：this.$tabsManager
```ts
export default {
  methods: {
    goToAbout() {
      this.$tabsManager.openTab('/src/views/about/page-index.vue',{
        _viewName: '关于页面'
      });
    },
  },
}
```
这里调用了 `openTab()`，这是用于编程式导航的方法。我们会在后面详细了解。

对于组合式 API，我们不能通过 `this` 访问组件实例，所以 VueTabRouter 给我们提供了一些组合式函数。
```vue
<script setup>
import { useTabsManager } from '@xsbcme/vue-tab-router';

const tabsManager = useTabsManager();

const goToAbout = ()=>{
    tabsManager.openTab('/src/views/about/page-index.vue',{
        _viewName: '关于页面'
    });
}
</script>
```
你现在不一定要完全理解这段代码，关键是要知道可以通过 `useTabsManager()` 来访问路由器实例。