# 内联导航
与基础导航相似，以标签页形式呈现超链接，其内部以 `Iframe` 标签渲染超链接内容。

**注意：** 内联导航中缓存无效，每次激活页面时，都会重新加载。刷新，关闭等函数与基础导航保持一致。

## 导航超链接页面
想要内联超链接页面，可以使用 `tabsManager.openTab` 方法。

```ts
// 打开百度页面
tabsManager.openTab('http://www.baidu.com/',{
    _viewName: '百度页面',
});

// 打开百度页面，并给页面传入参数
tabsManager.openTab('http://www.baidu.com/',{
    _viewName: '百度页面',
    username: '李四'
});

// 打开相对路径页面
tabsManager.openTab('relative:./home',{
    _viewName: '相对路径页面'
});

// 打开相对路径页面，并给页面传入参数
tabsManager.openTab('relative:./home',{
    _viewName: '相对路径页面',
    username: '王五'
});
```

## 内联导航事件
其内部以 `Iframe` 标签渲染超链接内容，当需要个性化 `Iframe` 时，VueTabRouter 提供了 `onIframeLoad` 事件，在 `Iframe` 加载完毕时触发。

```ts{8-10}
import { createTabsManager, StorageAdapter } from '@xsbcme/vue-tab-router';

const modules = import.meta.glob("@/views/**/page-index.vue", { eager: false });

const tabsManager = createTabsManager({
    modules,
    storageAdapter: new StorageAdapter(sessionStorage),
    onIframeLoad(e, tab) {
        console.log('onIframeLoad', e, tab);
    }
});

export default tabsManager;
```
`onIframeLoad` 是全局事件，某个内联导航被激活时，会触发该事件，可以根据第二个参数定制化。