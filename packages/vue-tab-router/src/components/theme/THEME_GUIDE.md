# 主题定制指南

vue-tab-router 提供了一套灵活的主题定制系统，让你可以轻松调整组件的视觉风格以匹配你的应用设计。

## 📋 目录

- [快速开始](#快速开始)
- [方法一：CSS 变量覆盖（推荐）](#方法一css-变量覆盖推荐)
- [方法二：JavaScript API](#方法二javascript-api)
- [方法三：CSS 类切换](#方法三css-类切换)
- [可用主题变量](#可用主题变量)
- [自定义主题示例](#自定义主题示例)
- [最佳实践](#最佳实践)

---

## 快速开始

### 安装

```bash
npm install @xsbcme/vue-tab-router
```

### 引入样式

在你的主入口文件中引入主题样式：

```typescript
// main.ts 或 main.js
import "@xsbcme/vue-tab-router/dist/theme.css";
```

---

## 方法一：CSS 变量覆盖（推荐）

这是最简单且推荐的方式。通过覆盖 CSS 变量来全局修改主题。

### 全局覆盖

```css
/* 在你的全局样式文件中 */
:root {
  /* 修改主色调为紫色 */
  --tab-color-primary: #722ed1;
  --tab-color-primary-hover: #9254de;
  --tab-color-primary-active: #531dab;

  /* 修改字体大小 */
  --tab-font-size: 16px;

  /* 修改圆角 */
  --tab-radius-sm: 8px;
  --tab-radius-md: 12px;
}
```

### 局部覆盖

只在特定容器内应用主题：

```css
.my-custom-tabs {
  --tab-color-primary: #52c41a;
  --tab-color-bg-base: #f6ffed;
  --tab-color-text-primary: #389e0d;
}
```

```vue
<template>
  <div class="my-custom-tabs">
    <DynamicTabsComponent />
  </div>
</template>
```

---

## 方法二：JavaScript API

使用提供的 API 动态切换主题。

### 基本用法

```typescript
import { applyTheme, darkTheme, lightTheme } from "@xsbcme/vue-tab-router";

// 应用深色主题
applyTheme(darkTheme);

// 应用浅色主题
applyTheme(lightTheme);
```

### 自定义主题

```typescript
import { applyTheme, TabTheme } from "@xsbcme/vue-tab-router";

const myCustomTheme: TabTheme = {
  name: "my-theme",
  colors: {
    primary: "#ff6b6b",
    primaryHover: "#ff8787",
    primaryActive: "#fa5252",

    textPrimary: "#212529",
    textSecondary: "#495057",
    textDisabled: "#adb5bd",

    bgBase: "#ffffff",
    bgElevated: "#f8f9fa",
    bgHover: "#e9ecef",
    bgActive: "#dee2e6",

    border: "#ced4da",
    borderDark: "#adb5bd",
  },
  sizes: {
    fontSize: "15px",
    spacingXs: "6px",
    spacingSm: "10px",
    spacingMd: "12px",
    spacingLg: "20px",
  },
  radius: {
    radiusSm: "6px",
    radiusMd: "10px",
    radiusLg: "24px",
    radiusCapsule: "20px",
  },
};

applyTheme(myCustomTheme);
```

### 运行时切换

```vue
<script setup lang="ts">
import { ref } from "vue";
import { applyTheme, darkTheme, defaultTheme } from "@xsbcme/vue-tab-router";

const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  applyTheme(isDark.value ? darkTheme : defaultTheme);
};
</script>

<template>
  <button @click="toggleTheme">
    {{ isDark ? "切换到浅色" : "切换到深色" }}
  </button>
</template>
```

---

## 方法三：CSS 类切换

通过添加/移除 CSS 类来切换预设主题。

```vue
<script setup lang="ts">
import { ref } from "vue";

const themeClass = ref("");

const setTheme = (theme: string) => {
  document.documentElement.className = theme;
};
</script>

<template>
  <div>
    <button @click="setTheme('tab-theme-light')">浅色主题</button>
    <button @click="setTheme('tab-theme-dark')">深色主题</button>
    <button @click="setTheme('')">默认主题</button>
  </div>
</template>
```

---

## 可用主题变量

### 颜色系统

| 变量名                       | 说明          | 默认值    |
| ---------------------------- | ------------- | --------- |
| `--tab-color-primary`        | 主色调        | `#165dff` |
| `--tab-color-primary-hover`  | 主色调-hover  | `#4080ff` |
| `--tab-color-primary-active` | 主色调-active | `#0e42d2` |
| `--tab-color-text-primary`   | 文本颜色-主要 | `#1d2129` |
| `--tab-color-text-secondary` | 文本颜色-次要 | `#4e5969` |
| `--tab-color-text-disabled`  | 文本颜色-禁用 | `#86909c` |
| `--tab-color-bg-base`        | 背景色-基础   | `#ffffff` |
| `--tab-color-bg-elevated`    | 背景色-浮层   | `#ffffff` |
| `--tab-color-bg-hover`       | 背景色-hover  | `#f2f3f5` |
| `--tab-color-bg-active`      | 背景色-active | `#e5e6eb` |
| `--tab-color-border`         | 边框颜色      | `#e5e6eb` |
| `--tab-color-border-dark`    | 边框颜色-深色 | `#c9cdd4` |

### 尺寸系统

| 变量名                  | 说明        | 默认值 |
| ----------------------- | ----------- | ------ |
| `--tab-font-size`       | 字体大小    | `14px` |
| `--tab-font-size-small` | 字体大小-小 | `12px` |
| `--tab-font-size-large` | 字体大小-大 | `16px` |
| `--tab-spacing-xs`      | 间距-超小   | `4px`  |
| `--tab-spacing-sm`      | 间距-小     | `7px`  |
| `--tab-spacing-md`      | 间距-中     | `8px`  |
| `--tab-spacing-lg`      | 间距-大     | `16px` |
| `--tab-icon-size`       | 图标尺寸    | `14px` |

### 圆角

| 变量名                 | 说明      | 默认值 |
| ---------------------- | --------- | ------ |
| `--tab-radius-sm`      | 圆角-小   | `4px`  |
| `--tab-radius-md`      | 圆角-中   | `6px`  |
| `--tab-radius-lg`      | 圆角-大   | `20px` |
| `--tab-radius-capsule` | 圆角-胶囊 | `16px` |

### 阴影

| 变量名                | 说明    | 默认值                           |
| --------------------- | ------- | -------------------------------- |
| `--tab-shadow-light`  | 阴影-轻 | `0 2px 8px rgba(0, 0, 0, 0.08)`  |
| `--tab-shadow-medium` | 阴影-中 | `0 4px 16px rgba(0, 0, 0, 0.12)` |
| `--tab-shadow-heavy`  | 阴影-重 | `0 8px 24px rgba(0, 0, 0, 0.16)` |

### 过渡动画

| 变量名                      | 说明     | 默认值  |
| --------------------------- | -------- | ------- |
| `--tab-transition-duration` | 过渡时长 | `0.15s` |
| `--tab-transition-timing`   | 过渡函数 | `ease`  |

---

## 自定义主题示例

### 示例 1：企业蓝主题

```css
:root {
  --tab-color-primary: #1890ff;
  --tab-color-primary-hover: #40a9ff;
  --tab-color-primary-active: #096dd9;

  --tab-color-text-primary: #262626;
  --tab-color-text-secondary: #595959;

  --tab-radius-sm: 4px;
  --tab-radius-md: 8px;
}
```

### 示例 2：清新绿主题

```css
:root {
  --tab-color-primary: #52c41a;
  --tab-color-primary-hover: #73d13d;
  --tab-color-primary-active: #389e0d;

  --tab-color-bg-hover: #f6ffed;
  --tab-color-bg-active: #d9f7be;

  --tab-font-size: 15px;
}
```

### 示例 3：优雅紫主题

```typescript
import { applyTheme, TabTheme } from "@xsbcme/vue-tab-router";

const purpleTheme: TabTheme = {
  name: "purple",
  colors: {
    primary: "#722ed1",
    primaryHover: "#9254de",
    primaryActive: "#531dab",

    textPrimary: "#262626",
    textSecondary: "#595959",
    textDisabled: "#bfbfbf",

    bgBase: "#ffffff",
    bgElevated: "#fafafa",
    bgHover: "#f0e6ff",
    bgActive: "#d6adf1",

    border: "#d9d9d9",
  },
  radius: {
    radiusSm: "8px",
    radiusMd: "12px",
    radiusLg: "24px",
    radiusCapsule: "20px",
  },
};

applyTheme(purpleTheme);
```

### 示例 4：暗黑模式

```css
.tab-theme-dark {
  --tab-color-primary: #177ddc;
  --tab-color-text-primary: #e8e8e8;
  --tab-color-text-secondary: #a6a6a6;

  --tab-color-bg-base: #1f1f1f;
  --tab-color-bg-elevated: #262626;
  --tab-color-bg-hover: #2d2d2d;
  --tab-color-bg-active: #3d3d3d;

  --tab-color-border: #434343;
}
```

---

## 最佳实践

### ✅ 推荐做法

1. **使用 CSS 变量**：优先使用 CSS 变量覆盖方式，性能最好
2. **定义设计令牌**：在项目中建立统一的设计令牌系统
3. **主题隔离**：如需多套主题共存，使用 CSS 类进行隔离
4. **渐进增强**：保留回退值，确保在不支持 CSS 变量的浏览器中也能正常显示

```css
/* 好的做法：带回退值 */
color: var(--tab-color-text-primary, #1d2129);
```

### ❌ 避免做法

1. **不要直接修改组件源码**：这会失去升级能力
2. **避免硬编码颜色**：始终使用 CSS 变量
3. **不要覆盖过多变量**：只修改需要的变量，保持简洁

### 主题优先级

```
JavaScript API > CSS 类 > :root 变量 > 组件默认值
```

### 性能优化

```typescript
// 批量应用主题，避免多次 DOM 操作
import { applyTheme } from "@xsbcme/vue-tab-router";

// ✅ 好的做法：一次性应用
applyTheme(customTheme);

// ❌ 避免：逐个设置变量
document.documentElement.style.setProperty("--tab-color-primary", "#xxx");
document.documentElement.style.setProperty("--tab-font-size", "16px");
// ...
```

---

## 常见问题

### Q: 如何重置为主题默认值？

```typescript
import { applyTheme, defaultTheme } from "@xsbcme/vue-tab-router";
applyTheme(defaultTheme);
```

或者清除 CSS 类：

```javascript
document.documentElement.className = "";
```

### Q: 如何让主题跟随系统偏好？

```typescript
import { applyTheme, darkTheme, defaultTheme } from "@xsbcme/vue-tab-router";

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
  applyTheme(e.matches ? darkTheme : defaultTheme);
};

prefersDark.addEventListener("change", updateTheme);
updateTheme(prefersDark); // 初始化
```

### Q: 主题变量不生效？

1. 确认已引入 `theme.css` 文件
2. 检查 CSS 变量拼写是否正确
3. 确认选择器优先级足够高
4. 使用浏览器开发者工具检查变量是否被覆盖

---

## 总结

vue-tab-router 的主题系统提供了三种灵活的定制方式：

- **CSS 变量**：简单高效，适合静态主题
- **JavaScript API**：动态灵活，适合运行时切换
- **CSS 类**：预设主题，适合快速切换

根据你的需求选择最合适的方式，轻松打造符合品牌风格的标签页组件！
