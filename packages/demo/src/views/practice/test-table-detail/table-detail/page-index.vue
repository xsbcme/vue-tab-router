<template>
  <a-card :style="{ height: '100%' }"> 当前页面接受到参数：{{ record }} </a-card>
</template>
<script lang="ts" setup>
const props = defineProps<{
  record: {
    key: string;
    name: string;
    salary: number;
    address: string;
    email: string;
  };
}>();

console.log("当前页面接收到参数", props.record);
</script>
<style lang="scss" scoped></style>
