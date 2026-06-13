<template>
  <DefaultStateBase type="not-found" :text="text" role="alert" icon="?" />
</template>

<script setup lang="ts">
import DefaultStateBase from "./base.vue";

withDefaults(
  defineProps<{
    text?: string;
  }>(),
  {
    text: "页面不存在",
  }
);
</script>