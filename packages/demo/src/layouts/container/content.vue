<template>
  <div class="content">
    <DynamicContainerComponent />
  </div>
</template>
<script lang="ts" setup>
import { DynamicContainerComponent } from "@xsbcme/vue-tab-router";
</script>
<style lang="scss" scoped>
.content {
  padding: 12px;
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}

@media (max-width: 768px) {
  .content {
    padding: 8px;
  }
}
</style>
