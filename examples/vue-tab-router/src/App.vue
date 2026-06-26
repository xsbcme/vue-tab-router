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

.dynamic-container__view-layer {
  background: var(--color-fill-2);
  isolation: isolate;
}

.workspace-shift-enter-active,
.workspace-shift-leave-active {
  position: absolute !important;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  backface-visibility: hidden;
  contain: paint;
  background: var(--color-fill-2);
  will-change: transform, opacity;
}

.workspace-shift-enter-active {
  z-index: 2;
  animation: workspace-shift-enter 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.workspace-shift-leave-active {
  z-index: 1;
  pointer-events: none;
  animation: workspace-shift-leave 140ms cubic-bezier(0.4, 0, 1, 1) both;
}

@keyframes workspace-shift-enter {
  0% {
    opacity: 0.96;
    transform: translate3d(0, 8px, 0) scale(0.998);
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes workspace-shift-leave {
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }

  100% {
    opacity: 0.92;
    transform: translate3d(0, -4px, 0) scale(0.998);
  }
}

@media (prefers-reduced-motion: reduce) {
  .workspace-shift-enter-active,
  .workspace-shift-leave-active {
    animation-duration: 1ms;
  }
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
