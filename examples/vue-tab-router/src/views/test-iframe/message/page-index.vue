<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="Iframe 通信测试">
    <a-space direction="vertical" fill>
      <a-alert>缓存 iframe 切换标签后应保留加载标识和页面内计数；不缓存 iframe 切换回来会重新加载。</a-alert>

      <a-divider orientation="left">链接打开方式</a-divider>
      <a-space wrap>
        <a-button type="primary" @click="openHttpInline">内部链接</a-button>
        <a-button @click="openHttpInlineWithParams">内部链接带参</a-button>
        <a-button @click="openHttpOutside">外部链接</a-button>
        <a-button @click="openHttpOutsideWithParams">外部链接带参</a-button>
        <a-button @click="openRelativeInline">内部相对链接</a-button>
        <a-button @click="openRelativeInlineWithParams">内部相对链接带参</a-button>
        <a-button @click="openRelativeOutside">外部相对链接</a-button>
        <a-button @click="openRelativeOutsideWithParams">外部相对链接带参</a-button>
      </a-space>

      <a-divider orientation="left">Iframe 通信、缓存与导航</a-divider>
      <a-space wrap>
        <a-button type="primary" @click="openCachedIframe">打开缓存 iframe</a-button>
        <a-button @click="openNoCacheIframe">打开不缓存 iframe</a-button>
        <a-button @click="openMessageIframe">打开通信 iframe</a-button>
        <a-button @click="openLinkIframe">打开链接 iframe</a-button>
        <a-button @click="openIframeWithHash">打开带 hash iframe</a-button>
        <a-button @click="openHashIframeOverview">打开 hash 加载验证</a-button>
        <a-button @click="openHashIframeDetail">切换 hash 片段</a-button>
        <a-button @click="openComponentTab">打开组件页用于切换</a-button>
        <a-button @click="sendToActiveIframe">向当前 iframe 发送消息</a-button>
        <a-button @click="sendToCachedIframeById">按 tabId 发送消息</a-button>
        <a-button @click="openMessageIframe">打开 iframe 后在页面内测试免 tabId</a-button>
        <a-button @click="copySyncedUrl">复制当前同步链接</a-button>
      </a-space>
      <a-alert>
        hash 加载验证用于确认 iframe 初次打开会显示加载状态；同文档 hash 切换完成后不会停留在加载状态，并会继续记录
        iframe load。 iframe 内可控超链接会通过 postMessage 请求宿主打开标签页，避免浏览器新标签页跳出工作台。
      </a-alert>
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="缓存 iframe tabId">{{ cachedIframeTabId || "-" }}</a-descriptions-item>
        <a-descriptions-item label="当前 iframe viewUrl">{{ activeIframeViewUrl }}</a-descriptions-item>
        <a-descriptions-item label="activeTab query">{{ activeTabQuery || "-" }}</a-descriptions-item>
      </a-descriptions>
      <a-list bordered :data="iframeLogs">
        <template #item="{ item }">
          <a-list-item>{{ item }}</a-list-item>
        </template>
      </a-list>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { useRoute } from "vue-router";
import { TabViewUrl, useTabsManager } from "@xsbcme/vue-tab-router";
import { iframeLogs } from "@/plugins/tab-router";

const tabsManager = useTabsManager();
const route = useRoute();
const cachedIframeTabId = ref<string>();

const activeIframeViewUrl = computed(() => {
  const viewUrl = tabsManager.activeTab?.viewUrl;
  return viewUrl && TabViewUrl.isIframe(viewUrl) ? viewUrl : "-";
});

const activeTabQuery = computed(() => {
  const value = route.query.activeTab;
  return Array.isArray(value) ? value[0] : value;
});

const openHttpInline = () => {
  tabsManager.openTab("https://www.baidu.com/", { _viewName: "内部链接" });
};

const openHttpInlineWithParams = () => {
  tabsManager.openTab("https://www.baidu.com/", { _viewName: "内部链接带参", a: 123 });
};

const openHttpOutside = () => {
  tabsManager.openTab("https://www.baidu.com/", { _viewOutside: true });
};

const openHttpOutsideWithParams = () => {
  tabsManager.openTab("https://www.baidu.com/", { _viewOutside: true, a: 123 });
};

const openRelativeInline = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./"), {
    _viewName: "内部相对链接",
    menuKey: "relative-inline",
  });
};

const openRelativeInlineWithParams = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./"), {
    _viewName: "内部相对链接带参",
    menuKey: "relative-inline-with-params",
    a: 123,
  });
};

const openRelativeOutside = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./"), {
    _viewOutside: true,
    menuKey: "relative-outside",
  });
};

const openRelativeOutsideWithParams = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./"), {
    _viewOutside: true,
    menuKey: "relative-outside-with-params",
    a: 123,
  });
};

const openCachedIframe = async () => {
  cachedIframeTabId.value = await tabsManager.openTab(TabViewUrl.createRelative("./iframe-tests/cache.html"), {
    _viewName: "缓存 Iframe 测试",
    cacheMode: "enabled",
    iframeDemo: true,
  });
};

const openNoCacheIframe = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./iframe-tests/cache.html"), {
    _viewName: "不缓存 Iframe 测试",
    _viewNoCache: true,
    cacheMode: "disabled",
    iframeDemo: true,
  });
};

const openMessageIframe = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./iframe-tests/message.html"), {
    _viewName: "Iframe 通信测试",
    iframeDemo: true,
  });
};

const openLinkIframe = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./iframe-tests/links.html"), {
    _viewName: "Iframe 链接测试",
    iframeDemo: true,
  });
};

const openIframeWithHash = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./iframe-tests/navigation.html?from=host#sync-demo"), {
    _viewName: "带 Hash Iframe 导航",
    iframeDemo: true,
  });
};

const openHashIframeOverview = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./iframe-tests/navigation.html?from=hash-load#overview"), {
    _viewName: "hash 加载验证",
    iframeDemo: true,
  });
};

const openHashIframeDetail = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./iframe-tests/navigation.html?from=hash-load#detail"), {
    _viewName: "hash 加载详情",
    iframeDemo: true,
  });
};

const openComponentTab = () => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: "Iframe 切换目标页",
    a: Date.now(),
  });
};

const sendToActiveIframe = () => {
  tabsManager.postIframeMessage({
    type: "host:active-message",
    time: new Date().toLocaleTimeString(),
  });
};

const sendToCachedIframeById = () => {
  tabsManager.postIframeMessage(
    {
      type: "host:tab-id-message",
      time: new Date().toLocaleTimeString(),
    },
    undefined,
    cachedIframeTabId.value
  );
};

const copySyncedUrl = async () => {
  await navigator.clipboard.writeText(window.location.href);
  Message.success("已复制当前同步链接");
};
</script>
