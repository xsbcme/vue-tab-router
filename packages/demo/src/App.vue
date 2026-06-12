<template>
  <router-view />
</template>

<script setup lang="ts"></script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  width: 100%;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (max-width: 768px) {
  body {
    min-width: 0;
  }

  .arco-card {
    border-radius: 6px;
  }

  .arco-card-body {
    padding: 12px;
  }

  .arco-card-header {
    min-height: 44px;
    padding: 0 12px;
  }

  .arco-card-header-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .arco-descriptions-size-medium .arco-descriptions-item-label,
  .arco-descriptions-size-medium .arco-descriptions-item-value {
    padding: 8px 10px;
  }

  .arco-space-horizontal.arco-space-wrap {
    row-gap: 8px;
  }

  .arco-table-container {
    overflow-x: auto;
  }

  .arco-table-cell {
    white-space: nowrap;
  }
}
</style>
