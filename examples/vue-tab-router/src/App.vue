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
  perspective: 1400px;
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
  background: var(--color-fill-2);
  isolation: isolate;
}

.page-turn-enter-active,
.page-turn-leave-active {
  position: absolute !important;
  inset: 0;
  width: 100%;
  min-height: 100%;
  overflow: hidden;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  contain: paint;
  will-change: transform, opacity;
}

.page-turn-enter-active {
  z-index: 2;
  animation: page-turn-enter 460ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.page-turn-leave-active {
  z-index: 1;
  pointer-events: none;
  transform-origin: left center;
  animation: page-turn-leave 460ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

.page-turn-enter-active::before,
.page-turn-leave-active::before,
.page-turn-enter-active::after,
.page-turn-leave-active::after {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  content: "";
}

.page-turn-enter-active::before {
  background: linear-gradient(90deg, rgba(29, 33, 41, 0.38), rgba(29, 33, 41, 0.1) 36%, transparent 72%);
  transform-origin: left center;
  animation: page-turn-enter-shade 460ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.page-turn-enter-active::after {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.48), rgba(29, 33, 41, 0.12), transparent 60%);
  transform-origin: left center;
  animation: page-turn-enter-fold 460ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.page-turn-leave-active::before {
  background: linear-gradient(90deg, transparent, rgba(29, 33, 41, 0.16) 54%, rgba(29, 33, 41, 0.36));
  transform-origin: left center;
  animation: page-turn-leave-shade 460ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

.page-turn-leave-active::after {
  left: auto;
  width: 34%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.46), rgba(29, 33, 41, 0.12));
  transform-origin: left center;
  animation: page-turn-leave-edge 460ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes page-turn-enter {
  0% {
    opacity: 0.18;
    transform: translate3d(18%, 0, 0) rotateY(-34deg) scale(0.992);
    transform-origin: left center;
  }

  52% {
    opacity: 0.84;
    transform: translate3d(4%, 0, 0) rotateY(-10deg) scale(0.998);
    transform-origin: left center;
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) rotateY(0) scale(1);
    transform-origin: left center;
  }
}

@keyframes page-turn-leave {
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) rotateY(0) scale(1);
  }

  54% {
    opacity: 0.72;
    transform: translate3d(-8%, 0, 0) rotateY(18deg) scale(0.996);
  }

  100% {
    opacity: 0;
    transform: translate3d(-20%, 0, 0) rotateY(38deg) scale(0.99);
  }
}

@keyframes page-turn-enter-shade {
  0% {
    opacity: 0.72;
  }

  100% {
    opacity: 0;
  }
}

@keyframes page-turn-enter-fold {
  0% {
    opacity: 0.54;
    transform: translate3d(-12%, 0, 0) scaleX(0.4);
  }

  56% {
    opacity: 0.2;
    transform: translate3d(-4%, 0, 0) scaleX(0.18);
  }

  100% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scaleX(0.04);
  }
}

@keyframes page-turn-leave-shade {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 0.46;
  }
}

@keyframes page-turn-leave-edge {
  0% {
    opacity: 0;
    transform: translate3d(24%, 0, 0) scaleX(0.24);
  }

  46% {
    opacity: 0.62;
    transform: translate3d(6%, 0, 0) scaleX(0.68);
  }

  100% {
    opacity: 0.1;
    transform: translate3d(-16%, 0, 0) scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-turn-enter-active,
  .page-turn-leave-active,
  .page-turn-enter-active::before,
  .page-turn-leave-active::before,
  .page-turn-enter-active::after,
  .page-turn-leave-active::after {
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
