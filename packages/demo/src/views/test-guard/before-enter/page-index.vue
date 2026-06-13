<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="进入守卫测试">
    <a-space direction="vertical">
      <div>进入标签页时触发回调，拒绝则无法激活此标签。</div>
      <a-switch v-model="allowEnter">
        <template #checked>允许进入</template>
        <template #unchecked>禁止进入</template>
      </a-switch>
    </a-space>
  </a-card>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { onBeforeTabEnter } from "@xsbcme/vue-tab-router";

const allowEnter = ref(true);

onBeforeTabEnter(async () => {
  if (allowEnter.value) return;
  Message.warning("当前页面进入守卫已拒绝激活");
  return false;
});
</script>
