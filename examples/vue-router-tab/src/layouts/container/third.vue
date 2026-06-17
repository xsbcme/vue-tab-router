<template>
  <div class="third">
    <div class="third-item">
      <a-link href="https://xsbcme.github.io/vue-tab-router/doc" target="_blank" icon>Doc</a-link>
    </div>
    <div class="third-item">
      <a-link href="https://www.npmjs.com/package/@xsbcme/vue-router-tab" target="_blank" icon>Npm</a-link>
    </div>
    <div class="third-item">
      <a-link href="https://github.com/xsbcme/vue-tab-router" target="_blank" icon>GitHub</a-link>
    </div>
    <div class="third-item">
      <a-link href="https://gitee.com/xsbcme/vue-tab-router" target="_blank" icon>Gitee</a-link>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.third {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  width: 100%;
  height: 100%;
  padding-right: 16px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .third {
    justify-content: flex-end;
    gap: 8px;
    min-width: 0;
    padding-right: 0;
    overflow: hidden;
  }

  .third-item {
    flex: 0 0 auto;
  }
}
</style>
