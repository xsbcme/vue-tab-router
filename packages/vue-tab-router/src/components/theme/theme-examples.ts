/**
 * 主题使用示例
 *
 * 本文件展示了如何在项目中使用 vue-tab-router 的主题系统
 */

import { applyTheme, TabTheme, defaultTheme, darkTheme, lightTheme } from ".";

// ==========================================
// 示例 1: 使用预设主题
// ==========================================

// 应用深色主题
export function useDarkTheme() {
  applyTheme(darkTheme);
}

// 应用浅色主题
export function useLightTheme() {
  applyTheme(lightTheme);
}

// 恢复默认主题
export function useDefaultTheme() {
  applyTheme(defaultTheme);
}

// ==========================================
// 示例 2: 创建自定义主题
// ==========================================

// 企业蓝主题
export const enterpriseBlueTheme: TabTheme = {
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
  sizes: {
    fontSize: "14px",
    spacingXs: "4px",
    spacingSm: "8px",
    spacingMd: "12px",
    spacingLg: "16px",
  },
  radius: {
    radiusSm: "4px",
    radiusMd: "8px",
    radiusLg: "20px",
    radiusCapsule: "16px",
  },
};

// 清新绿主题
export const freshGreenTheme: TabTheme = {
  name: "fresh-green",
  colors: {
    primary: "#52c41a",
    primaryHover: "#73d13d",
    primaryActive: "#389e0d",

    textPrimary: "#262626",
    textSecondary: "#595959",
    textDisabled: "#bfbfbf",

    bgBase: "#ffffff",
    bgElevated: "#fcffe6",
    bgHover: "#f6ffed",
    bgActive: "#d9f7be",

    border: "#d9d9d9",
  },
};

// 优雅紫主题
export const elegantPurpleTheme: TabTheme = {
  name: "elegant-purple",
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

// ==========================================
// 示例 3: Vue 组件中使用
// ==========================================

/*
<template>
    <div class="app-container">
        <!-- 主题切换器 -->
        <div class="theme-switcher">
            <button @click="setTheme('default')">默认</button>
            <button @click="setTheme('dark')">深色</button>
            <button @click="setTheme('light')">浅色</button>
            <button @click="setTheme('custom')">自定义</button>
        </div>
        
        <!-- 标签页组件 -->
        <DynamicTabsComponent type="card" />
    </div>
</template>

<script setup lang="ts">
import { DynamicTabsComponent } from '@xsbcme/vue-tab-router';
import { applyTheme, defaultTheme, darkTheme, lightTheme, enterpriseBlueTheme } from '@xsbcme/vue-tab-router';

const setTheme = (themeName: string) => {
    switch (themeName) {
        case 'default':
            applyTheme(defaultTheme);
            break;
        case 'dark':
            applyTheme(darkTheme);
            break;
        case 'light':
            applyTheme(lightTheme);
            break;
        case 'custom':
            applyTheme(enterpriseBlueTheme);
            break;
    }
};
</script>

<style scoped>
.theme-switcher {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}
</style>
*/

// ==========================================
// 示例 4: 跟随系统主题偏好
// ==========================================

export function followSystemTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
    applyTheme(e.matches ? darkTheme : lightTheme);
  };

  // 监听系统主题变化
  prefersDark.addEventListener("change", updateTheme);

  // 初始化
  updateTheme(prefersDark);

  // 返回清理函数
  return () => {
    prefersDark.removeEventListener("change", updateTheme);
  };
}

// ==========================================
// 示例 5: 在特定容器内应用主题
// ==========================================

/*
<template>
    <div class="my-app">
        <!-- 这个容器内的标签页使用自定义主题 -->
        <div class="custom-theme-container">
            <DynamicTabsComponent />
        </div>
        
        <!-- 这个容器内的标签页使用默认主题 -->
        <div class="default-theme-container">
            <DynamicTabsComponent />
        </div>
    </div>
</template>

<style>
.custom-theme-container {
    --tab-color-primary: #ff6b6b;
    --tab-color-bg-hover: #fff0f0;
    --tab-color-bg-active: #ffd8d8;
    --tab-font-size: 16px;
    --tab-radius-sm: 8px;
}
</style>
*/

// ==========================================
// 示例 6: 从用户设置中加载主题
// ==========================================

interface UserPreferences {
  theme: "default" | "dark" | "light" | "custom";
}

const THEME_STORAGE_KEY = "vue-tab-router-theme";

export function loadUserTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      const preferences: UserPreferences = JSON.parse(saved);
      applyThemeByPreference(preferences.theme);
    }
  } catch (error) {
    console.warn("Failed to load user theme:", error);
    applyTheme(defaultTheme);
  }
}

export function saveUserTheme(theme: UserPreferences["theme"]) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ theme }));
    applyThemeByPreference(theme);
  } catch (error) {
    console.warn("Failed to save user theme:", error);
  }
}

function applyThemeByPreference(theme: UserPreferences["theme"]) {
  switch (theme) {
    case "dark":
      applyTheme(darkTheme);
      break;
    case "light":
      applyTheme(lightTheme);
      break;
    case "custom":
      applyTheme(enterpriseBlueTheme);
      break;
    default:
      applyTheme(defaultTheme);
  }
}

// ==========================================
// 示例 7: 主题切换动画
// ==========================================

export function applyThemeWithTransition(theme: TabTheme, duration = 300) {
  const root = document.documentElement;

  // 添加过渡类
  root.classList.add("theme-transitioning");
  root.style.setProperty("--theme-transition-duration", `${duration}ms`);

  // 应用新主题
  applyTheme(theme);

  // 移除过渡类
  setTimeout(() => {
    root.classList.remove("theme-transitioning");
    root.style.removeProperty("--theme-transition-duration");
  }, duration);
}

/*
在全局样式中添加：

.theme-transitioning * {
    transition: background-color var(--theme-transition-duration, 300ms) ease,
                color var(--theme-transition-duration, 300ms) ease,
                border-color var(--theme-transition-duration, 300ms) ease !important;
}
*/
