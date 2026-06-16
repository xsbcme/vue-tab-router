# 类型与工具 API

本页整理常用类型、工具方法和存储适配器。类型都可以从 `@xsbcme/vue-tab-router` 导入。

## TabsManagerOptions

`createTabsManager(options)` 的配置类型。

```ts
interface TabsManagerOptions {
  views: TabsManagerViewsOptions;
  storage?: TabsManagerStorageOptions;
  plugins?: TabsManagerPlugin[];
  render?: TabsManagerRenderOptions;
  iframe?: TabsManagerIframeOptions;
  guards?: TabsManagerGuardsOptions;
  detached?: TabsManagerDetachedOptions;
}
```

主要字段说明见 [TabsManager API](/views/api/tabs-manager#createtabsmanageroptions)。

## TabViewMeta

页面元数据类型。

```ts
interface TabViewMeta {
  id?: string | number;
  title?: string;
  icon?: string;
  viewUrl?: string;
  props?: IOpenTabOptions;
  meta?: Record<string, unknown>;
  children?: TabViewMeta[];
}
```

说明：

- `title` / `icon` 会作为 `openTab` 默认标题和图标。
- `props` 直接复用 `IOpenTabOptions`。
- `children` 用于面包屑层级。
- `meta` 是业务自定义字段，库不会自动合并到 tab props。

详细用法见 [页面元数据与层级](/views/guide/view-meta)。

## IOpenTabOptions

`openTab(viewUrl, options)` 的参数类型。

| 字段                | 说明                           |
| ------------------- | ------------------------------ |
| `_viewName`         | tab 标题。                     |
| `_viewIcon`         | tab 图标。                     |
| `_viewNoCache`      | 是否禁用缓存。                 |
| `_viewSingle`       | 是否单例。                     |
| `_viewPinned`       | 是否置顶。                     |
| `_viewNoDrag`       | 是否禁止拖拽。                 |
| `_viewOutside`      | 是否使用浏览器新窗口打开链接；也可传 `{ target, features }` 作为 `window.open` 参数。 |

其他字段会进入 `tab.viewProps`。

## ViewOutsideOptions

`_viewOutside` 传对象时使用的 `window.open` 配置类型。

```ts
interface ViewOutsideOptions {
  target?: string;
  features?: string;
}
```

简写 `_viewOutside: true` 会直接调用 `window.open(viewUrl)`；对象写法会调用 `window.open(viewUrl, target, features)`。

## TabsVirtualOptions

内置标签栏虚拟滚动配置，可用于 `render.tabs.virtual` 或 `DynamicTabsComponent` 的 `virtual` prop。

```ts
type TabsVirtualOptions =
  | boolean
  | {
      enabled?: boolean;
      threshold?: number;
      overscan?: number;
      estimatedWidth?: number;
      minWidth?: number;
      maxWidth?: number;
    };
```

默认值为 `{ enabled: true, threshold: 30, overscan: 6, estimatedWidth: 148, minWidth: 72, maxWidth: 260 }`。

## IUpdateTabOptions

`updateTabOptions(options, tabId?)` 的参数类型。可更新标题、图标、URL、缓存、单例、置顶、拖拽和业务 props。

```ts
await tabsManager.updateTabOptions({
  _viewName: "已保存",
  status: "saved",
});
```

业务 props 采用浅合并。

## CloseTabOptions / CloseTabsOptions

```ts
interface CloseTabOptions {
  ignoreNoClose?: boolean;
  skipGuard?: boolean;
}

interface CloseTabsOptions extends CloseTabOptions {
  continueOnRejected?: boolean;
}
```

用于 `closeTab` 和批量关闭方法。

## TabViewUrl

链接型页面工具命名空间。

```ts
import { TabViewUrl } from "@xsbcme/vue-tab-router";

const relativeUrl = TabViewUrl.createRelative("./iframe-tests/message.html");
```

常见用途：

- `TabViewUrl.createRelative(url)`：创建相对 iframe 地址。
- `TabViewUrl.createIframeController(controllerUrl, iframeSrc?)`：创建 iframe controller 地址，`controllerUrl` 是隐藏挂载的 Vue 控制组件，`iframeSrc` 是默认 iframe 地址。
- `TabViewUrl.isRelative(url)`：判断是否为相对 iframe 地址。
- `TabViewUrl.isHttp(url)`：判断是否为 http/https 地址。
- `TabViewUrl.isIframeController(url)`：判断是否为 iframe controller 地址。
- `TabViewUrl.isIframe(url)`：判断是否为 iframe/link 类型页面。
- `TabViewUrl.resolveIframeController(url)`：解析 iframe controller 的控制组件路径和默认 iframe 地址。
- `TabViewUrl.resolveIframe(url)`：解析 iframe 实际加载地址。

iframe controller 示例：

```ts
const viewUrl = TabViewUrl.createIframeController(
  "/src/views/report/controller/page-index.vue",
  TabViewUrl.createRelative("./iframe-tests/message.html")
);
```

生成的 `viewUrl` 使用普通 URL 查询参数结构：

```txt
iframe-controller:/src/views/report/controller/page-index.vue?src=relative%3A.%2Fiframe-tests%2Fmessage.html
```

也可以直接在外部菜单或第三方系统里手写同样的单链接：

```txt
iframe-controller:/src/views/report/controller/page-index.vue?src=relative%3A.%2Fiframe-tests%2Fmessage.html&reportId=1001&mode=preview
```

规则：

- `iframe-controller:` 后面的路径是 controller 组件路径，需要存在于 `views.modules`。
- `src` 是默认 iframe 地址，会被 `TabViewUrl.resolveIframe()` 解析；如果 `src` 自身包含 `?`、`&`、`#`，需要按 URL query 参数规则编码。
- 除 `src` 外的 query 参数会合并进 tab `viewProps`，controller 可以读取，也会作为默认查询参数透传给 iframe。
- `openTab(viewUrl, options)` 显式传入的 `options` 优先级高于 `viewUrl` query 中的同名参数。
- controller 内部 `defineIframeOptions({ src })` 可以覆盖 iframe 地址；如果最终 `src` 中已有同名查询参数，`src` 中的值优先于默认透传参数。

例如：

```txt
iframe-controller:/src/views/report/controller/page-index.vue?src=relative%3A.%2Fiframe-tests%2Fmessage.html%3Ftheme%3Ddark%23ready&reportId=1001
```

最终 iframe 地址类似：

```txt
./iframe-tests/message.html?theme=dark&reportId=1001#ready
```

controller 组件可以通过 `defineIframeOptions({ messageOrigins })` 为当前 tab 单独声明消息来源。未声明时使用全局 `iframe.messageOrigins`，全局也未声明时默认只允许同源消息。

## StorageAdapter

内置存储适配器，默认使用 `sessionStorage`。

```ts
import { StorageAdapter } from "@xsbcme/vue-tab-router";

const adapter = new StorageAdapter(localStorage);

createTabsManager({
  views: { modules },
  storage: {
    adapter,
  },
});
```

## AbstractStorageAdapter

自定义存储适配器需要实现：

```ts
class CustomStorageAdapter extends AbstractStorageAdapter {
  get<T = unknown>(key: string, def?: T): T {
    return readValue(key) ?? def;
  }

  set<T = unknown>(key: string, value: T): this {
    writeValue(key, value);
    return this;
  }

  del(key: string): this {
    removeValue(key);
    return this;
  }
}
```

## iframe 类型

### IframeMessageEvent

宿主接收 iframe 消息时的上下文。

| 字段                    | 说明                    |
| ----------------------- | ----------------------- |
| `data`                  | iframe 发送的原始数据。 |
| `origin`                | 消息来源 origin。       |
| `source`                | 消息来源窗口。          |
| `rawEvent`              | 原始 `MessageEvent`。   |
| `tab`                   | iframe 所属 tab 信息。  |
| `tabId`                 | iframe 所属 tabId。     |
| `reply(data, options?)` | 回复当前 iframe。       |

### IframePostMessageOptions

```ts
interface IframePostMessageOptions {
  targetOrigin?: string;
  transfer?: Transferable[];
}
```

### IframeMessageOriginValidator

允许接收 iframe 消息的来源配置。

```ts
messageOrigins: ["self", "https://example.com"];
```

支持：

- `"self"`：当前页面同源。
- `"*"`：任意来源，生产环境不建议。
- 指定 origin 字符串。
- 自定义校验函数。

## 菜单与面包屑类型

| 类型                | 说明                     |
| ------------------- | ------------------------ |
| `TabMenuItemLike`   | 默认可识别的菜单项结构。 |
| `UseTabMenuOptions` | `useTabMenu` 配置。      |
| `UseTabMenuReturn`  | `useTabMenu` 返回值。    |
| `TabBreadcrumbItem` | 面包屑数据项。           |

## 插件类型

| 类型                       | 说明                    |
| -------------------------- | ----------------------- |
| `TabsManagerPlugin`        | 插件函数或插件对象。    |
| `TabsManagerPluginContext` | 插件 setup 上下文。     |
| `TabsManagerHookMap`       | hook 参数映射。         |
| `TabsManagerHookName`      | hook 名称联合类型。     |
| `TabsManagerHooks`         | hook 注册与触发管理器。 |

详见 [插件与 hooks API](/views/api/plugins)。
