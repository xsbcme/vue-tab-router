<template>
  <DefaultStateBase type="empty" :text="text" role="status" />
</template>

<script setup lang="ts">
import DefaultStateBase from "./base.vue";

withDefaults(
  defineProps<{
    text?: string;
  }>(),
  {
    text: "暂无打开的页面",
  }
);
</script>