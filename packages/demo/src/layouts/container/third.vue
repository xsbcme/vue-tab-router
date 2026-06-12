<template>
  <div class="third">
    <div class="third-item">
      <a-link href="https://www.npmjs.com/package/@xsbcme/vue-tab-router" target="_blank" icon>Npm</a-link>
    </div>
    <div class="third-item">
      <a-link href="https://github.com/xsbcme/vue-tab-router" target="_blank" icon>GitHub</a-link>
    </div>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="scss" scoped>
.third {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding-right: 16px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .third {
    justify-content: flex-end;
    gap: 8px;
    padding-right: 0;
    min-width: 0;
    overflow: hidden;
  }

  .third-item {
    flex: 0 0 auto;
  }
}
</style>
