<template>
    <svg viewBox="0 0 1024 1024" :width="size" :height="size" fill="currentColor">
        <path d="M384 213.333L256 341.333 469.333 512 256 682.667 384 810.667 725.333 512z" />
    </svg>
</template>
<script setup lang="ts">
defineProps<{ size?: string | number }>();
</script>
