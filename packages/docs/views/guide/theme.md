# 主题与组件样式

这一页适合在功能接入完成后阅读。你可以先使用内置样式跑通工作台，再按项目设计系统调整变量和组件表现。

`DynamicTabsComponent` 内置了基础标签栏样式，并通过 CSS 变量和运行时主题 API 暴露定制能力。

## CSS 变量

主题样式通过 CSS 变量驱动。静态主题或接入已有设计系统时，优先覆盖 CSS 变量。

```css
:root {
  --tab-color-primary: #165dff;
  --tab-color-bg-hover: #f2f3f5;
  --tab-radius-sm: 4px;
}
```

也可以只在某个容器内覆盖变量：

```vue
<template>
  <div class="custom-tabs-theme">
    <DynamicTabsComponent />
  </div>
</template>

<style scoped>
.custom-tabs-theme {
  --tab-color-primary: #52c41a;
  --tab-color-bg-hover: #f6ffed;
  --tab-color-bg-active: #d9f7be;
  --tab-radius-sm: 8px;
}
</style>
```

## 标签栏组件属性

```vue
<DynamicTabsComponent type="card" show-icon default-icon="icon-apps" />
```

| 属性             | 类型                                                   | 默认值   | 说明                                            |
| ---------------- | ------------------------------------------------------ | -------- | ----------------------------------------------- |
| `type`           | `"text" \| "line" \| "card" \| "rounded" \| "capsule"` | `"text"` | 标签栏风格                                      |
| `showIcon`       | `boolean`                                              | `true`   | 是否显示图标；未传时使用 `render.tabs.showIcon` |
| `defaultIcon`    | `string`                                               | -        | 未设置 `viewIcon` 时显示的图标                  |
| `titleMaxLength` | `number`                                               | `28`     | 标签标题最大显示长度                            |
| `draggable`      | `boolean`                                              | `true`   | 是否启用拖拽排序                                |
| `virtual`        | `boolean \| object`                                    | `{ threshold: 30 }` | 虚拟滚动配置，默认启用且标签数量达到阈值后生效 |
| `hideFirst`      | `boolean`                                              | `false`  | 隐藏 `_isFirst` 首页标签，预览容器内部使用      |

`titleMaxLength`、`showIcon`、`draggable` 和 `virtual` 可在 `createTabsManager({ render: { tabs } })` 中配置；组件 prop 会覆盖全局配置。

虚拟滚动完整默认值为 `{ enabled: true, threshold: 30, overscan: 6, estimatedWidth: 148, minWidth: 72, maxWidth: 260 }`。

## 运行时主题

```ts
import { applyTheme, darkTheme, defaultTheme, lightTheme } from "@xsbcme/vue-tab-router";

applyTheme(darkTheme);
applyTheme(lightTheme);
applyTheme(defaultTheme);
```

也可以把主题应用到指定容器：

```ts
applyTheme(darkTheme, document.querySelector(".workbench-tabs"));
```

### 自定义主题

```ts
import { applyTheme, type TabTheme } from "@xsbcme/vue-tab-router";

const enterpriseBlueTheme: TabTheme = {
  name: "enterprise-blue",
  colors: {
    primary: "#1890ff",
    primaryHover: "#40a9ff",
    primaryActive: "#096dd9",
    textPrimary: "#262626",
    textSecondary: "#595959",
    textDisabled: "#bfbfbf",
    bgBase: "#ffffff",
    bgElevated: "#fafafa",
    bgHover: "#e6f7ff",
    bgActive: "#bae7ff",
    border: "#d9d9d9",
    borderDark: "#bfbfbf",
  },
  radius: {
    radiusSm: "4px",
    radiusMd: "8px",
    radiusLg: "20px",
    radiusCapsule: "16px",
  },
};

applyTheme(enterpriseBlueTheme);
```

### 跟随系统主题

```ts
import { applyTheme, darkTheme, lightTheme } from "@xsbcme/vue-tab-router";

export function followSystemTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const updateTheme = (event: MediaQueryListEvent | MediaQueryList) => {
    applyTheme(event.matches ? darkTheme : lightTheme);
  };

  prefersDark.addEventListener("change", updateTheme);
  updateTheme(prefersDark);

  return () => prefersDark.removeEventListener("change", updateTheme);
}
```

### 保存用户偏好

```ts
import { applyTheme, darkTheme, defaultTheme, lightTheme } from "@xsbcme/vue-tab-router";

type ThemeName = "default" | "dark" | "light";
const THEME_STORAGE_KEY = "vue-tab-router-theme";

const themeMap = {
  default: defaultTheme,
  dark: darkTheme,
  light: lightTheme,
};

export function saveTheme(themeName: ThemeName) {
  localStorage.setItem(THEME_STORAGE_KEY, themeName);
  applyTheme(themeMap[themeName]);
}

export function loadTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
  applyTheme(themeMap[saved || "default"] || defaultTheme);
}
```

### 切换动画

```ts
import { applyTheme, type TabTheme } from "@xsbcme/vue-tab-router";

export function applyThemeWithTransition(theme: TabTheme, duration = 300) {
  const root = document.documentElement;
  root.classList.add("theme-transitioning");
  root.style.setProperty("--theme-transition-duration", `${duration}ms`);
  applyTheme(theme);

  window.setTimeout(() => {
    root.classList.remove("theme-transitioning");
    root.style.removeProperty("--theme-transition-duration");
  }, duration);
}
```

```css
.theme-transitioning * {
  transition:
    background-color var(--theme-transition-duration, 300ms) ease,
    color var(--theme-transition-duration, 300ms) ease,
    border-color var(--theme-transition-duration, 300ms) ease !important;
}
```

## 常用变量

| 变量                        | 说明       |
| --------------------------- | ---------- |
| `--tab-color-primary`       | 主色       |
| `--tab-color-text-primary`  | 主要文字色 |
| `--tab-color-bg-base`       | 基础背景   |
| `--tab-color-bg-hover`      | hover 背景 |
| `--tab-color-bg-active`     | 激活背景   |
| `--tab-color-border`        | 边框色     |
| `--tab-font-size`           | 字号       |
| `--tab-icon-size`           | 图标尺寸   |
| `--tab-radius-sm`           | 小圆角     |
| `--tab-radius-capsule`      | 胶囊圆角   |
| `--tab-transition-duration` | 过渡时长   |

## 使用建议

- 业务系统已有设计规范时，优先覆盖 CSS 变量。
- 需要用户切换主题时，使用 `applyTheme`。
- 已有标签栏设计时，可以只消费 `useTabsManager().tabs` 自行渲染 UI。
- 示例主题和使用片段放在文档中维护，运行时包只保留 `applyTheme`、预设主题和类型定义。
