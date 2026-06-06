<template>
  <svg viewBox="0 0 1024 1024" :width="size" :height="size" fill="currentColor">
    <path
      d="M213.333 213.333h298.667v85.334H298.667v426.666h426.666V512h85.334v298.667H213.333V213.333zm384 0h213.334v213.334h-85.334V358.827L469.333 614.827l-60.266-60.267 256-256H597.333v-85.333z"
    />
  </svg>
</template>
<script setup lang="ts">
defineProps<{ size?: string | number }>();
</script>
