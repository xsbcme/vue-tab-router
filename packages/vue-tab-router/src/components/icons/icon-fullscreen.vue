<template>
  <svg viewBox="0 0 1024 1024" :width="size" :height="size" fill="currentColor">
    <path
      v-if="!fullscreen"
      d="M213.333 213.333h256v85.334H298.667v170.666h-85.334V213.333zm341.334 0h256v256h-85.334V298.667H554.667v-85.334zM298.667 554.667v170.666h170.666v85.334h-256v-256h85.334zm426.666 0h85.334v256h-256v-85.334h170.666V554.667z"
    />
    <path
      v-else
      d="M213.333 682.667h128v128h85.334V597.333H213.333v85.334zm128-341.334h-128v85.334h213.334V213.333h-85.334v128zm256 469.334h85.334v-128h128v-85.334H597.333v213.334zm85.334-469.334v-128h-85.334v213.334h213.334v-85.334h-128z"
    />
  </svg>
</template>
<script setup lang="ts">
defineProps<{
  size?: string | number;
  fullscreen?: boolean;
}>();
</script>
