import { defineConfig } from "vitepress";

const normalizeBase = (base = "/") => {
  if (base === "./") return base;
  const prefixed = base.startsWith("/") ? base : `/${base}`;
  return prefixed.endsWith("/") ? prefixed : `${prefixed}/`;
};

const siteBase = normalizeBase(process.env.VITEPRESS_BASE);
const demoUrl = process.env.DOCS_DEMO_URL ?? process.env.VITEPRESS_DEMO_URL;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: siteBase,
  lang: "zh-CN",
  title: "VueTabRouter",
  titleTemplate: "多标签页路由插件",
  description: "一个专注于 Vue 3 的多标签页路由插件文档站点",
  head: [["link", { rel: "icon", type: "image/png", href: `${siteBase}logo.png` }]],
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/images/logo.png",
    search: {
      provider: "local",
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档",
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                },
              },
            },
          },
        },
      },
    },
    lastUpdatedText: "上次更新",
    returnToTopLabel: "返回顶部",
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    outline: {
      level: "deep",
      label: "页面导航",
    },
    nav: [
      { text: "指南", link: "/views/guide/" },
      { text: "API", link: "/views/api/" },
      { text: "Demo", link: "/views/demo/" },
      ...(demoUrl ? [{ text: "在线 Demo", link: demoUrl }] : []),
      { text: "更新日志", link: "/views/log/" },
    ],

    sidebar: {
      "/views/guide/": [
        {
          text: "先认识",
          items: [
            { text: "什么是 VueTabRouter？", link: "/views/guide/" },
            { text: "入门约定", link: "/views/guide/introduction" },
          ],
        },
        {
          text: "最小接入",
          items: [
            { text: "快速开始", link: "/views/guide/getting-started" },
            { text: "页面入口与 viewUrl", link: "/views/guide/view-url" },
            { text: "基础页面导航", link: "/views/guide/basic-navigation" },
            { text: "页面元信息与更新", link: "/views/guide/tab-options" },
          ],
        },
        {
          text: "工作台增强",
          items: [
            { text: "内联页面导航", link: "/views/guide/inline-navigation" },
            { text: "外链页面导航", link: "/views/guide/outside-navigation" },
            { text: "页面元数据与层级", link: "/views/guide/view-meta" },
            { text: "菜单联动", link: "/views/guide/menu-integration" },
            { text: "面包屑导航", link: "/views/guide/breadcrumb" },
            { text: "页面缓存控制", link: "/views/guide/cache-control" },
          ],
        },
        {
          text: "集成与扩展",
          items: [
            {
              text: "页面事件通信与守卫",
              link: "/views/guide/events-and-guards",
            },
            { text: "Iframe 通信与缓存", link: "/views/guide/iframe-communication" },
            {
              text: "与 VueRouter 结合使用",
              link: "/views/guide/vue-router-integration",
            },
            { text: "地址栏同步与浏览器历史", link: "/views/guide/url-sync" },
            { text: "插件扩展", link: "/views/guide/plugins" },
            {
              text: "首页与预览容器方案",
              link: "/views/guide/first-tab-and-preview",
            },
          ],
        },
        {
          text: "参考与排障",
          items: [
            { text: "实现文档（源码版）", link: "/views/guide/implementation" },
            { text: "主题与组件样式", link: "/views/guide/theme" },
            { text: "常见问题", link: "/views/guide/faq" },
          ],
        },
      ],
      "/views/api/": [
        {
          text: "API 参考",
          items: [
            { text: "总览", link: "/views/api/" },
            { text: "TabsManager", link: "/views/api/tabs-manager" },
            { text: "组合式 API", link: "/views/api/composables" },
            { text: "内置组件", link: "/views/api/components" },
            { text: "插件与 hooks", link: "/views/api/plugins" },
            { text: "类型与工具", link: "/views/api/types-and-utils" },
          ],
        },
      ],
      "/views/demo/": [
        {
          text: "Demo",
          items: [{ text: "本地演示项目", link: "/views/demo/" }],
        },
      ],
      "/views/log/": [],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/xsbcme/vue-tab-router" },
      {
        icon: "npm",
        link: "https://www.npmjs.com/package/@xsbcme/vue-tab-router",
      },
    ],
  },
});
