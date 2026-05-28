<template>
  <a-card :style="{ height: '100%' }">
    <div>
      <div>这里是路由目标页面</div>
      <div>页面接收参数：{{ props }}</div>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
const props = defineProps<{
  a?: number;
}>();
</script>
<style lang="scss" scoped></style>
