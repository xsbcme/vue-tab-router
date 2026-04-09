<template>
    <svg viewBox="0 0 1024 1024" :width="size" :height="size" fill="currentColor">
        <path d="M195.2 195.2a42.667 42.667 0 0 1 60.267 0L512 451.733l256.533-256.533a42.667 42.667 0 0 1 60.267 60.267L572.267 512l256.533 256.533a42.667 42.667 0 0 1-60.267 60.267L512 572.267 255.467 828.8a42.667 42.667 0 0 1-60.267-60.267L451.733 512 195.2 255.467a42.667 42.667 0 0 1 0-60.267z" />
    </svg>
</template>
<script setup lang="ts">
defineProps<{ size?: string | number }>();
</script>
