<template>
  <DefaultStateBase type="loading" :text="text" role="status" aria-live="polite" />
</template>

<script setup lang="ts">
import DefaultStateBase from "./base.vue";

withDefaults(
  defineProps<{
    text?: string;
  }>(),
  {
    text: "加载中...",
  }
);
</script>