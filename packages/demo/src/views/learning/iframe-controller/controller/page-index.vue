<template></template>

<script setup lang="ts">
import { defineIframeOptions, useTabsManager } from "@xsbcme/vue-tab-router";
import { iframeLogs } from "@/plugins/tab-router";

const tabsManager = useTabsManager();

const pushIframeLog = (message: string) => {
  iframeLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
  iframeLogs.value = iframeLogs.value.slice(0, 30);
};

defineIframeOptions({
  styles: `
    body { outline: 4px solid rgba(22, 93, 255, 0.18); outline-offset: -4px; }
    h2::after { content: ' - controller style'; color: #165dff; font-size: 14px; }
  `,
  onLoad: ({ tab }) => {
    pushIframeLog(`controller load ${tab.viewName || tab.viewUrl}`);
  },
  onMessage: async message => {
    pushIframeLog(`controller message ${JSON.stringify(message.data)}`);
    const data = message.data;
    if (!data || typeof data !== "object") return;

    const payload = data as Record<string, unknown>;
    if (payload.type === "iframe:refresh-current") {
      await tabsManager.refreshTab(message.tabId);
      message.reply({ type: "controller:refreshed" });
      return false;
    }
    if (payload.type === "iframe:close-current") {
      await tabsManager.closeTab(message.tabId);
      message.reply({ type: "controller:close-requested" });
      return false;
    }
    if (payload.type === "iframe:open-tab" && typeof payload.viewUrl === "string") {
      const tabId = await tabsManager.openTab(payload.viewUrl, payload.options as Record<string, unknown> | undefined);
      message.reply({ type: "controller:opened", tabId });
      return false;
    }
    if (payload.type === "page:message") {
      message.reply({ type: "controller:page-message-received", time: new Date().toISOString() });
      return false;
    }
  },
});
</script>
