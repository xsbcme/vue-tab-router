import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: "VueTabRouter",
  titleTemplate: "Simple Vue.js plugin",
  description: "A VueTabRouter Site",
  head: [['link', { rel: 'icon', href: '/images/logo.png' }]],
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/images/logo.png',
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          },
        }
      }
    },
    lastUpdatedText: '上次更新',
    returnToTopLabel: '返回顶部',
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    outline: {
      level: [2, 3],
      label: '页面导航'
    },
    nav: [
      { text: '指南', link: '/views/guide/' },
      { text: 'API', link: '/views/api/' },
      { text: '更新日志', link: '/views/log/' }
    ],

    sidebar: {
      '/views/guide/': [
        {
          text: '简介',
          items: [
            { text: '什么是 VueTabRouter？', link: '/views/guide/' },
            { text: '快速开始', link: '/views/guide/getting-started' },
          ]
        },
        {
          text: '基础',
          items: [
            { text: '入门', link: '/views/guide/introduction' },
            { text: '基础导航', link: '/views/guide/basic-navigation' },
            { text: '内联导航', link: '/views/guide/inline-navigation' },
            { text: '外链导航', link: '/views/guide/outside-navigation' },
          ]
        },
        // {
        //   text: '进阶',
        //   items: [
        //     { text: '什么是 VueTabRouter？', link: '/views/guide/' },
        //     { text: '快速开始', link: '/views/guide/getting-started' },
        //   ]
        // },
        // {
        //   text: '个性化',
        //   items: [
        //     { text: '什么是 VueTabRouter？', link: '/views/guide/' },
        //     { text: '快速开始', link: '/views/guide/getting-started' },
        //   ]
        // },
        // {
        //   text: '解决方案',
        //   items: [
        //     { text: '什么是 VueTabRouter？', link: '/views/guide/' },
        //     { text: '快速开始', link: '/views/guide/getting-started' },
        //   ]
        // },
      ],
      '/views/api/': [
        {
          text: 'API',
          items: [
            { text: '111', link: '/views/api/text' },
          ]
        }
      ],
      '/views/log/': []
    },

    socialLinks: [
      { icon: 'github', link: 'https://gitee.com/xsbcme/vue-tab-router-demo' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@xsbcme/vue-tab-router' }
    ]
  }
})
