import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { Menu } from "@/model/menu";

export default defineStore("menu", () => {
  // 定义后台菜单，可远程获取。
  const menus = ref([
    {
      name: "最小入门",
      children: [
        {
          name: "最小打开页面",
          url: "/src/views/learning/start/page-index.vue",
        },
        {
          name: "打开与复用",
          url: "/src/views/learning/basic-open/page-index.vue",
        },
      ],
    },
    {
      name: "基础操作",
      children: [
        {
          name: "当前页操作",
          url: "/src/views/learning/current-actions/page-index.vue",
        },
        {
          name: "缓存对照",
          url: "/src/views/learning/cache/page-index.vue",
        },
        {
          name: "批量与排序",
          url: "/src/views/learning/batch-sort/page-index.vue",
        },
      ],
    },
    {
      name: "菜单与层级",
      url: "/src/views/learning/menu-breadcrumb/page-index.vue",
    },
    {
      name: "通信与守卫",
      children: [
        {
          name: "父子通信",
          url: "/src/views/learning/events/page-index.vue",
        },
        {
          name: "页面守卫",
          url: "/src/views/learning/guards/page-index.vue",
        },
      ],
    },
    {
      name: "链接与 Iframe",
      children: [
        {
          name: "链接打开方式",
          url: "/src/views/learning/iframe-links/page-index.vue",
        },
        {
          name: "Iframe 缓存",
          url: "/src/views/learning/iframe-cache/page-index.vue",
        },
        {
          name: "Iframe 消息",
          url: "/src/views/learning/iframe-message/page-index.vue",
        },
        {
          name: "Iframe 导航同步",
          url: "/src/views/learning/iframe-navigation/page-index.vue",
        },
      ],
    },
    {
      name: "弹窗与预览",
      children: [
        {
          name: "弹窗显示",
          url: "/src/views/learning/detached/page-index.vue",
        },
        {
          name: "预览容器",
          url: "/src/views/learning/preview/page-index.vue",
        },
      ],
    },
    {
      name: "扩展与外观",
      icon: "IconApps",
      children: [
        {
          name: "插件 Hooks",
          url: "/src/views/learning/plugin-hooks/page-index.vue",
        },
        {
          name: "主题与图标",
          url: "/src/views/learning/theme/page-index.vue",
        },
        {
          name: "状态组件",
          url: "/src/views/test-theme/state-components/page-index.vue",
        },
      ],
    },
    {
      name: "项目实践",
      children: [
        {
          name: "能力组合总览",
          url: "/src/views/practice/overview/page-index.vue",
        },
        {
          name: "客户运营工作台",
          url: "/src/views/practice/customer-workbench/page-index.vue",
        },
        {
          name: "订单处理中心",
          url: "/src/views/practice/order-center/page-index.vue",
        },
        {
          name: "运营复盘报表",
          url: "/src/views/practice/operations-report/page-index.vue",
        },
        {
          name: "列表详情联动",
          url: "/src/views/practice/test-table-detail/page-index.vue",
        },
      ],
    },
    {
      name: "API 覆盖检查",
      url: "/src/views/learning/api-check/page-index.vue",
    },
  ]);

  const getMenus = computed(() => menus.value.map(item => new Menu(item)));

  return {
    getMenus,
  };
});
