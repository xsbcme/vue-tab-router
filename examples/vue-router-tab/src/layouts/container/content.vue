<template>
  <div class="content">
    <DynamicContainerComponent />
  </div>
</template>

<script setup lang="ts">
import { DynamicContainerComponent } from "@xsbcme/vue-router-tab";
</script>

<style scoped lang="scss">
.content {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 12px;
  overflow: auto;
}

@media (max-width: 768px) {
  .content {
    padding: 8px;
  }
}
</style>
