# 基础导航
借助 VueTabRouter 的实例方法，通过编写代码来实现路由跳转。

## 导航到不同的页面
**注意: 下面的示例中的 tabsManager 指代路由器实例。在组件内部，你可以使用 $tabsManager 属性访问路由，例如 this.$tabsManager.openTab(...)。如果使用组合式 API，你可以通过调用 useTabsManager() 来访问路由器。**

想要导航到不同的页面，可以使用 `tabsManager.openTab` 方法。

```ts
// 打开关于页面
tabsManager.openTab('/src/views/about/page-index.vue');

// 打开关于页面，并给页面传入参数
tabsManager.openTab('/src/views/about/page-index.vue',{
    _viewName: '关于页面',
    username: '张三',
    age: 18
});
```

其中 `_viewName` 为内置参数，这类参数以 _ 开头将不会作为参数传递给页面，在这里它的作用为打开新标签页时的标题。其他参数这里不做讲解，在后面API定义中会有介绍。

**注意：** 此函数 `tabsManager.openTab` 其内部是根据路径和传入的参数（内置参数除外）决定是否为同一个标签页，这意味着当你之前打开了一个页面，并且传入了相同的参数，再次调用 `tabsManager.openTab` 时，VueTabRouter 会认为你希望打开的是同一个页面，而不会创建新的标签页。


## 刷新导航页面
想要刷新标签页页面，可以使用 `tabsManager.refreshTab` 方法。

```ts
// 刷新当前激活的标签页
tabsManager.refreshTab();

// 刷新指定标签页
tabsManager.refreshTab('aXGc');

// 刷新所有标签页
tabsManager.refreshTabAll();
```
默认情况下，打开的标签页默认启用缓存，组件的生命周期函数如 `onMounted` 只会在新打开的标签页触发一次，后面再次激活将不会触发，但 `onActivated` 和 `onDeactivated` 可正常触发。

**注意：** 关于 `tabId` 如何获：
- `tabsManager.tabs`将提供当前打开的标签页列表。
- 使用 VueTabRouter 中导出的 `useTabId` 的函数。


## 关闭导航页面
想要关闭标签页页面，可以使用 `tabsManager.closeTab` 方法，此方法关闭当前标签页成功后，自动会激活 **来源标签页（当前处于A标签页，当打开了B标签页，则A标签页即为B标签页的来源）**。

```ts
// 刷新当前激活的标签页
tabsManager.closeTab();

// 刷新指定标签页
tabsManager.closeTab('aXGc');

// 关闭所有标签页
tabsManager.closeTabByAll();
```

**注意：** 不能关闭标签页属性为 `_noClose` 的页面。