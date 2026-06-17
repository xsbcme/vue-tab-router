---
"@xsbcme/vue-tab-router": minor
---

新增 iframe controller 模式，可通过 `TabViewUrl.createIframeController(controllerUrl, iframeSrc?)` 打开由 Vue 控制组件托管的 iframe 标签页。controller 组件隐藏挂载在宿主应用中，通过 `defineIframeOptions()` 局部声明 iframe 的 `src`、`styles`、`messageOrigins`、`onLoad` 和 `onMessage`，让 iframe 的加载、样式注入和消息处理跟随具体 tab 维护。

iframe controller 地址改为普通 URL query 结构：`iframe-controller:<controllerUrl>?src=<iframeSrc>&<业务参数>`。外部菜单或第三方系统可以直接配置单链接；除 `src` 外的 query 参数会合并进 tab `viewProps`，controller 可读取，也会作为默认查询参数透传给真实 iframe。`openTab(viewUrl, options)` 的显式参数优先于 URL query，controller 内 `defineIframeOptions({ src })` 可覆盖最终 iframe 地址，且最终 `src` 自身已有的同名 query 参数优先。

新增 iframe client 子入口和浏览器全局包。受控 iframe 页面可以从 `@xsbcme/vue-tab-router/iframe/client` 或 `dist/browser/iframe-client.global.js` 使用 `createIframeTabClient()`，通过内置协议请求获取当前 tab、更新当前 tab、打开子 tab、刷新、关闭和发送事件；浏览器全局包不依赖 Vue。

统一宿主向 iframe 发送消息的 API：`tabsManager.postIframeMessage(data, options?, tabId?)`。不传 `tabId` 时默认发送给当前激活 iframe，指定 tab 时把 `tabId` 放在第三个参数；第二个参数支持 `undefined` 或 `null` 表示无额外发送配置。页面组件内部新增 `useIframeMessenger().postMessage(data, options?)`，用于自动绑定当前 tab。

完善 iframe controller 的缓存、刷新和释放行为：controller 局部配置不会因为普通标签切换丢失；iframe 真实 `load` 后再注入局部样式并触发 controller `onLoad`；关闭、刷新或清空标签时会释放 iframe 引用和 controller 配置；controller `onMessage` 返回 `false` 时会阻止全局 iframe 消息处理。

补充 iframe 通信与样式、iframe client、iframe controller、单链接 controller 和百度直链 controller 演示，并在文档中说明 controller 的两层模型、URL 结构、参数透传、消息来源校验、生命周期顺序和释放边界。

BREAKING CHANGE：移除旧的 `iframe-controller:%2F...::...` 地址格式，不再兼容旧分隔符方案；移除 `postActiveIframeMessage`、`postCurrentIframeMessage` 和旧顺序 `postIframeMessage(tabId, data, options?)`，请改用 `postIframeMessage(data, options?, tabId?)` 或 `useIframeMessenger()`。
