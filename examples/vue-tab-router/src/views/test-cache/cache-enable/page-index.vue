<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="缓存启用测试">
    <div>
      <div>缓存启用 - 默认启用</div>
      <div>当前时间：{{ time }}</div>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import { ref } from "vue";

const time = ref(new Date().toLocaleString());
</script>
<style lang="scss" scoped></style>
