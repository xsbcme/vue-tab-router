# 主题与组件样式

这一页适合在功能接入完成后阅读。你可以先使用内置样式跑通工作台，再按项目设计系统调整变量和组件表现。

`DynamicTabsComponent` 内置了基础标签栏样式，并通过 CSS 变量和运行时主题 API 暴露定制能力。

## CSS 变量

```css
:root {
  --tab-color-primary: #165dff;
  --tab-color-bg-hover: #f2f3f5;
  --tab-radius-sm: 4px;
}
```

## 标签栏组件属性

```vue
<DynamicTabsComponent type="card" show-icon default-icon="icon-apps" />
```

| 属性          | 类型                                                   | 默认值   | 说明                                       |
| ------------- | ------------------------------------------------------ | -------- | ------------------------------------------ |
| `type`        | `"text" \| "line" \| "card" \| "rounded" \| "capsule"` | `"text"` | 标签栏风格                                 |
| `showIcon`    | `boolean`                                              | `true`   | 是否显示图标；未传时使用 `render.showIcon` |
| `defaultIcon` | `string`                                               | -        | 未设置 `viewIcon` 时显示的图标             |
| `hideFirst`   | `boolean`                                              | `false`  | 隐藏 `_isFirst` 首页标签，预览容器内部使用 |

`viewNameMaxLength` 和 `showIcon` 可在 `createTabsManager({ render })` 中配置，会影响内置标签栏标题截断和图标显示；组件 prop 会覆盖全局配置。

## 运行时主题

```ts
import { applyTheme, darkTheme, defaultTheme } from "@xsbcme/vue-tab-router";

applyTheme(darkTheme);
applyTheme(defaultTheme);
```

也可以把主题应用到指定容器：

```ts
applyTheme(darkTheme, document.querySelector(".workbench-tabs"));
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
