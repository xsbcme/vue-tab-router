<template>
    <svg viewBox="0 0 1024 1024" :width="size" :height="size" fill="currentColor">
        <path d="M512 170.667a341.333 341.333 0 1 0 320.384 456.107 42.667 42.667 0 0 1 80.213 29.44A426.667 426.667 0 1 1 896 512v85.333l-106.667-106.666L682.667 597.333V512a341.013 341.013 0 0 0-170.667-341.333z" />
    </svg>
</template>
<script setup lang="ts">
defineProps<{ size?: string | number }>();
</script>
