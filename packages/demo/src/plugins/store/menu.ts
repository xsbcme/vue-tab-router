import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { Menu } from "@/model/menu";

export default defineStore("menu", () => {
  // 定义后台菜单，可远程获取。
  const menus = ref([
    {
      name: "测试工作台",
      children: [
        {
          name: "API 覆盖检查",
          url: "/src/views/test-api/overview/page-index.vue",
        },
        {
          name: "导航与缓存",
          url: "/src/views/test-workbench/navigation-cache/page-index.vue",
        },
        {
          name: "通信与守卫",
          url: "/src/views/test-workbench/communication-guards/page-index.vue",
        },
        {
          name: "弹窗显示",
          url: "/src/views/test-detached/container/page-index.vue",
        },
        {
          name: "链接与 Iframe",
          url: "/src/views/test-iframe/message/page-index.vue",
        },
        {
          name: "插件与主题",
          url: "/src/views/test-theme/icons/page-index.vue",
          icon: "IconApps",
        },
        {
          name: "项目实践",
          url: "/src/views/practice/test-table-detail/page-index.vue",
        },
      ],
    },
  ]);

  const getMenus = computed(() => menus.value.map(item => new Menu(item)));

  return {
    getMenus,
  };
});
