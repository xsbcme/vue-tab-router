import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { Menu } from "@/model/menu";

export default defineStore("menu", () => {
  // 定义后台菜单，可远程获取。
  const menus = ref([
    {
      name: "基础功能",
      children: [
        {
          name: "路由测试",
          children: [
            {
              name: "单例模式",
              url: "/src/views/test-router/router-single/page-index.vue",
            },
            {
              name: "多例模式",
              url: "/src/views/test-router/router-no-single/page-index.vue",
            },
          ],
        },
        {
          name: "缓存测试",
          children: [
            {
              name: "缓存启用",
              url: "/src/views/test-cache/cache-enable/page-index.vue",
            },
            {
              name: "缓存关闭",
              url: "/src/views/test-cache/cache-colse/page-index.vue",
              props: {
                _viewNoCache: true,
              },
            },
          ],
        },
        {
          name: "刷新当前页",
          url: "/src/views/test-refresh/page-index.vue",
        },
        {
          name: "更新当前页",
          url: "/src/views/test-update/page-index.vue",
        },
        {
          name: "关闭当前页",
          url: "/src/views/test-close/page-index.vue",
        },
        {
          name: "父子通信",
          url: "/src/views/test-message/message-parent/page-index.vue",
        },
        {
          name: "守卫测试",
          children: [
            // {
            //     name: '打开页面前',
            //     url: '/src/views/test-guard/before-open/page-index.vue'
            // },
            // {
            //     name: '进入页面前',
            //     url: '/src/views/test-guard/before-enter/page-index.vue'
            // },
            {
              name: "离开页面前",
              url: "/src/views/test-guard/before-leave/page-index.vue",
            },
            {
              name: "关闭页面前",
              url: "/src/views/test-guard/before-close/page-index.vue",
            },
          ],
        },
        {
          name: "链接测试",
          children: [
            {
              name: "内部链接",
              url: "http://www.baidu.com/",
            },
            {
              name: "内部链接带参",
              url: "http://www.baidu.com/",
              props: {
                a: 123,
              },
            },

            {
              name: "外部链接",
              url: "http://www.baidu.com/",
              props: {
                _viewOutside: true,
              },
            },
            {
              name: "外部链接带参",
              url: "http://www.baidu.com/",
              props: {
                _viewOutside: true,
                a: 123,
              },
            },

            {
              name: "内部相对链接",
              url: "relative:./",
            },
            {
              name: "内部相对链接带参",
              url: "relative:./",
              props: {
                a: 123,
              },
            },

            {
              name: "外部相对链接",
              url: "relative:./",
              props: {
                _viewOutside: true,
              },
            },
            {
              name: "外部相对链接带参",
              url: "relative:./",
              props: {
                _viewOutside: true,
                a: 123,
              },
            },
          ],
        },
      ],
    },
    {
      name: "项目实践",
      children: [
        {
          name: "表格查看",
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
