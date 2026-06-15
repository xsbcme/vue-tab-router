---
"@xsbcme/vue-tab-router": minor
---

新增 iframe controller 模式，可通过 `TabViewUrl.createIframeController(controllerUrl, iframeSrc?)` 打开由 Vue 控制组件托管的 iframe 标签页。controller 组件隐藏挂载在宿主应用中，通过 `defineIframeOptions()` 局部声明 iframe 的 `src`、`styles`、`messageOrigins`、`onLoad` 和 `onMessage`，让 iframe 的加载、样式注入和消息处理跟随具体 tab 维护。

新增 iframe client 子入口和浏览器全局包。受控 iframe 页面可以从 `@xsbcme/vue-tab-router/iframe-client` 或 `dist/browser/iframe-client.global.js` 使用 `createIframeTabClient()`，通过内置协议请求获取当前 tab、更新当前 tab、打开子 tab、刷新、关闭和发送事件；浏览器全局包不依赖 Vue。

完善 iframe controller 的缓存、刷新和释放行为：controller 局部配置不会因为普通标签切换丢失；iframe 真实 `load` 后再注入局部样式并触发 controller `onLoad`；关闭、刷新或清空标签时会释放 iframe 引用和 controller 配置；controller `onMessage` 返回 `false` 时会阻止全局 iframe 消息处理。

补充 iframe 通信与样式、iframe client、iframe controller 和百度直链 controller 演示，并在文档中说明 controller 的两层模型、参数归属、消息来源校验、生命周期顺序和释放边界。
