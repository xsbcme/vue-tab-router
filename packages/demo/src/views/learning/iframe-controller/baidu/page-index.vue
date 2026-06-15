<template></template>

<script setup lang="ts">
import { defineIframeOptions } from "@xsbcme/vue-tab-router";
import { iframeLogs } from "@/plugins/tab-router";

const pushIframeLog = (message: string) => {
  iframeLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
  iframeLogs.value = iframeLogs.value.slice(0, 30);
};

defineIframeOptions({
  src: "https://www.baidu.com",
  onLoad: ({ tab }) => {
    pushIframeLog(`baidu controller load ${tab.viewName || tab.viewUrl}`);
  },
});
</script>
