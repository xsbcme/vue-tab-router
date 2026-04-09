<template>
    <svg viewBox="0 0 1024 1024" :width="size" :height="size" fill="currentColor">
        <path d="M640 213.333L298.667 512 640 810.667 768 682.667 554.667 512 768 341.333z" />
    </svg>
</template>
<script setup lang="ts">
defineProps<{ size?: string | number }>();
</script>
