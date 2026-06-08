/**
 * 主题配置类型定义
 */

/**
 * 颜色系统配置
 */
export interface ThemeColors {
  /** 主色调 */
  primary: string;
  /** 主色调-hover */
  primaryHover?: string;
  /** 主色调-active */
  primaryActive?: string;

  /** 文本颜色-主要 */
  textPrimary: string;
  /** 文本颜色-次要 */
  textSecondary: string;
  /** 文本颜色-禁用 */
  textDisabled: string;

  /** 背景色-基础 */
  bgBase: string;
  /** 背景色-浮层 */
  bgElevated: string;
  /** 背景色-hover */
  bgHover: string;
  /** 背景色-active */
  bgActive: string;

  /** 边框颜色 */
  border: string;
  /** 边框颜色-深色 */
  borderDark?: string;
}

/**
 * 尺寸配置
 */
export interface ThemeSizes {
  /** 字体大小 */
  fontSize?: string;
  /** 字体大小-小 */
  fontSizeSmall?: string;
  /** 字体大小-大 */
  fontSizeLarge?: string;

  /** 间距-超小 */
  spacingXs?: string;
  /** 间距-小 */
  spacingSm?: string;
  /** 间距-中 */
  spacingMd?: string;
  /** 间距-大 */
  spacingLg?: string;

  /** 图标尺寸 */
  iconSize?: string;
}

/**
 * 圆角配置
 */
export interface ThemeRadius {
  /** 圆角-小 */
  radiusSm?: string;
  /** 圆角-中 */
  radiusMd?: string;
  /** 圆角-大 */
  radiusLg?: string;
  /** 圆角-胶囊 */
  radiusCapsule?: string;
}

/**
 * 阴影配置
 */
export interface ThemeShadows {
  /** 阴影-轻 */
  shadowLight?: string;
  /** 阴影-中 */
  shadowMedium?: string;
  /** 阴影-重 */
  shadowHeavy?: string;
}

/**
 * 过渡动画配置
 */
export interface ThemeTransitions {
  /** 过渡时长 */
  duration?: string;
  /** 过渡函数 */
  timingFunction?: string;
}

/**
 * 完整主题配置
 */
export interface TabTheme {
  /** 主题名称 */
  name?: string;
  /** 颜色配置 */
  colors: ThemeColors;
  /** 尺寸配置 */
  sizes?: ThemeSizes;
  /** 圆角配置 */
  radius?: ThemeRadius;
  /** 阴影配置 */
  shadows?: ThemeShadows;
  /** 过渡配置 */
  transitions?: ThemeTransitions;
}

/**
 * 默认主题配置（Arco Design 风格）
 */
export const defaultTheme: TabTheme = {
  name: "arco-design",
  colors: {
    primary: "#165dff",
    primaryHover: "#4080ff",
    primaryActive: "#0e42d2",

    textPrimary: "#1d2129",
    textSecondary: "#4e5969",
    textDisabled: "#86909c",

    bgBase: "#ffffff",
    bgElevated: "#ffffff",
    bgHover: "#f2f3f5",
    bgActive: "#e5e6eb",

    border: "#e5e6eb",
    borderDark: "#c9cdd4",
  },
  sizes: {
    fontSize: "14px",
    fontSizeSmall: "12px",
    fontSizeLarge: "16px",

    spacingXs: "4px",
    spacingSm: "7px",
    spacingMd: "8px",
    spacingLg: "16px",

    iconSize: "14px",
  },
  radius: {
    radiusSm: "4px",
    radiusMd: "6px",
    radiusLg: "20px",
    radiusCapsule: "16px",
  },
  shadows: {
    shadowLight: "0 2px 8px rgba(0, 0, 0, 0.08)",
    shadowMedium: "0 4px 16px rgba(0, 0, 0, 0.12)",
    shadowHeavy: "0 8px 24px rgba(0, 0, 0, 0.16)",
  },
  transitions: {
    duration: "0.15s",
    timingFunction: "ease",
  },
};

/**
 * 浅色主题
 */
export const lightTheme: TabTheme = {
  name: "light",
  colors: {
    primary: "#1890ff",
    primaryHover: "#40a9ff",
    primaryActive: "#096dd9",

    textPrimary: "#262626",
    textSecondary: "#595959",
    textDisabled: "#bfbfbf",

    bgBase: "#ffffff",
    bgElevated: "#ffffff",
    bgHover: "#f5f5f5",
    bgActive: "#e8e8e8",

    border: "#d9d9d9",
    borderDark: "#bfbfbf",
  },
};

/**
 * 深色主题
 */
export const darkTheme: TabTheme = {
  name: "dark",
  colors: {
    primary: "#177ddc",
    primaryHover: "#3c9ae8",
    primaryActive: "#0f5fae",

    textPrimary: "#e8e8e8",
    textSecondary: "#a6a6a6",
    textDisabled: "#595959",

    bgBase: "#1f1f1f",
    bgElevated: "#262626",
    bgHover: "#2d2d2d",
    bgActive: "#3d3d3d",

    border: "#434343",
    borderDark: "#595959",
  },
};

/**
 * 将主题配置转换为 CSS 变量对象
 */
export function themeToCssVariables(theme: TabTheme): Record<string, string> {
  const variables: Record<string, string> = {};

  // 颜色变量
  if (theme.colors) {
    variables["--tab-color-primary"] = theme.colors.primary;
    if (theme.colors.primaryHover) variables["--tab-color-primary-hover"] = theme.colors.primaryHover;
    if (theme.colors.primaryActive) variables["--tab-color-primary-active"] = theme.colors.primaryActive;

    variables["--tab-color-text-primary"] = theme.colors.textPrimary;
    variables["--tab-color-text-secondary"] = theme.colors.textSecondary;
    variables["--tab-color-text-disabled"] = theme.colors.textDisabled;

    variables["--tab-color-bg-base"] = theme.colors.bgBase;
    variables["--tab-color-bg-elevated"] = theme.colors.bgElevated;
    variables["--tab-color-bg-hover"] = theme.colors.bgHover;
    variables["--tab-color-bg-active"] = theme.colors.bgActive;

    variables["--tab-color-border"] = theme.colors.border;
    if (theme.colors.borderDark) variables["--tab-color-border-dark"] = theme.colors.borderDark;
  }

  // 尺寸变量
  if (theme.sizes) {
    if (theme.sizes.fontSize) variables["--tab-font-size"] = theme.sizes.fontSize;
    if (theme.sizes.fontSizeSmall) variables["--tab-font-size-small"] = theme.sizes.fontSizeSmall;
    if (theme.sizes.fontSizeLarge) variables["--tab-font-size-large"] = theme.sizes.fontSizeLarge;

    if (theme.sizes.spacingXs) variables["--tab-spacing-xs"] = theme.sizes.spacingXs;
    if (theme.sizes.spacingSm) variables["--tab-spacing-sm"] = theme.sizes.spacingSm;
    if (theme.sizes.spacingMd) variables["--tab-spacing-md"] = theme.sizes.spacingMd;
    if (theme.sizes.spacingLg) variables["--tab-spacing-lg"] = theme.sizes.spacingLg;

    if (theme.sizes.iconSize) variables["--tab-icon-size"] = theme.sizes.iconSize;
  }

  // 圆角变量
  if (theme.radius) {
    if (theme.radius.radiusSm) variables["--tab-radius-sm"] = theme.radius.radiusSm;
    if (theme.radius.radiusMd) variables["--tab-radius-md"] = theme.radius.radiusMd;
    if (theme.radius.radiusLg) variables["--tab-radius-lg"] = theme.radius.radiusLg;
    if (theme.radius.radiusCapsule) variables["--tab-radius-capsule"] = theme.radius.radiusCapsule;
  }

  // 阴影变量
  if (theme.shadows) {
    if (theme.shadows.shadowLight) variables["--tab-shadow-light"] = theme.shadows.shadowLight;
    if (theme.shadows.shadowMedium) variables["--tab-shadow-medium"] = theme.shadows.shadowMedium;
    if (theme.shadows.shadowHeavy) variables["--tab-shadow-heavy"] = theme.shadows.shadowHeavy;
  }

  // 过渡变量
  if (theme.transitions) {
    if (theme.transitions.duration) variables["--tab-transition-duration"] = theme.transitions.duration;
    if (theme.transitions.timingFunction) variables["--tab-transition-timing"] = theme.transitions.timingFunction;
  }

  return variables;
}

/**
 * 应用主题到指定元素（默认为 document.documentElement）
 */
export function applyTheme(theme: TabTheme, element?: HTMLElement | null): void {
  const target = element || (typeof document === "undefined" ? undefined : document.documentElement);
  if (!target) return;
  const variables = themeToCssVariables(theme);

  Object.entries(variables).forEach(([key, value]) => {
    target.style.setProperty(key, value);
  });
}
