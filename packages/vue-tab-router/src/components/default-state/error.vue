<template>
  <DefaultStateBase type="error" :text="text" role="alert" icon="!" />
</template>

<script setup lang="ts">
import DefaultStateBase from "./base.vue";

withDefaults(
  defineProps<{
    text?: string;
  }>(),
  {
    text: "页面加载失败",
  }
);
</script>