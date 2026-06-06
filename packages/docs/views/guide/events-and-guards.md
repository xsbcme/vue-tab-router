# 页面事件通信与守卫

## 1) 页面事件通信（子页 -> 来源页）

通信模型是“由谁打开我，我回调给谁”。

### 来源页注册事件

```ts
import { defineTabEvents } from "@xsbcme/vue-tab-router";

defineTabEvents({
  saved: payload => {
    console.log("子页完成保存", payload);
  },
});
```

### 子页发送事件

```ts
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();
tabsManager.emit("saved", { id: 1001 });
```

内部会按 `{sourceTabId}_{eventName}` 路由消息。

## 2) 页面级守卫

守卫返回 `false`、抛错或返回 rejected Promise 时，当前流程会被中断。

### 进入守卫：`onBeforeTabEnter`

```ts
import { onBeforeTabEnter } from "@xsbcme/vue-tab-router";

onBeforeTabEnter(async (toTab, fromTab) => {
  console.log("进入当前页", fromTab?.viewUrl, "=>", toTab.viewUrl);
});
```

### 离开守卫：`onBeforeTabLeave`

```ts
import { onBeforeTabLeave } from "@xsbcme/vue-tab-router";

onBeforeTabLeave(async () => {
  const ok = window.confirm("当前页面有未保存内容，确认离开？");
  if (!ok) return false;
});
```

### 关闭守卫：`onBeforeTabClose`

```ts
import { onBeforeTabClose } from "@xsbcme/vue-tab-router";

onBeforeTabClose(async () => {
  const ok = window.confirm("确认关闭当前标签页？");
  if (!ok) return false;
});
```

## 3) 全局守卫

创建管理器时可配置：

```ts
const tabsManager = createTabsManager({
  views: {
    modules,
  },
  guards: {
    beforeOpen: async (toTab, fromTab) => {
      console.log("open", fromTab?.viewUrl, "=>", toTab.viewUrl);
    },
    beforeEnter: async (toTab, fromTab) => {
      console.log("enter", fromTab?.viewUrl, "=>", toTab.viewUrl);
    },
    beforeLeave: async (toTab, fromTab) => {
      console.log("leave", fromTab?.viewUrl, "=>", toTab.viewUrl);
    },
    beforeClose: async (closingTab, sourceTab) => {
      console.log("close", closingTab.viewUrl, "source:", sourceTab?.viewUrl);
    },
  },
});
```

建议把“权限检查、埋点、统一日志”放全局守卫，把“未保存拦截”放页面级守卫。
