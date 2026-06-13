<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="通信子页面测试">
    <div>
      <div>当前为A页面</div>
      <div>
        <input type="text" v-model="message" />
        <button @click="handleSendMessage">点我发送数据</button>
      </div>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

const message = ref("666");
const handleSendMessage = () => {
  tabsManager.emit("message-parent-to-child", message.value);
};
</script>
<style lang="scss" scoped></style>
