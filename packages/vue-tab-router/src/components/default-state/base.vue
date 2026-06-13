<template>
  <div class="dynamic-state" :class="`dynamic-state--${type}`" :role="role" :aria-live="ariaLive">
    <span v-if="type === 'loading'" class="dynamic-state__loading" aria-hidden="true" />
    <span v-else-if="type === 'empty'" class="dynamic-state__empty" aria-hidden="true" />
    <span v-else class="dynamic-state__icon" aria-hidden="true">{{ icon }}</span>
    <span class="dynamic-state__text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type: "loading" | "error" | "empty" | "not-found";
    text: string;
    role?: "status" | "alert";
    ariaLive?: "polite" | "assertive";
    icon?: string;
  }>(),
  {
    role: "status",
    ariaLive: undefined,
    icon: "!",
  }
);
</script>

<style lang="scss" scoped>
.dynamic-state {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--tab-spacing-md, 8px);
  padding: var(--tab-spacing-lg, 16px);
  background: var(--tab-color-bg-base, #fff);
  color: var(--tab-color-text-secondary, #4e5969);
  font-size: var(--tab-font-size, 14px);
  line-height: 20px;
}

.dynamic-state--empty {
  color: var(--tab-color-text-disabled, #86909c);
}

.dynamic-state__loading,
.dynamic-state__icon,
.dynamic-state__empty {
  box-sizing: border-box;
  flex: 0 0 auto;
}

.dynamic-state__loading {
  width: 16px;
  height: 16px;
  border: 2px solid var(--tab-color-border, #e5e6eb);
  border-top-color: var(--tab-color-primary, #165dff);
  border-radius: 50%;
  animation: dynamic-state-rotate 0.8s linear infinite;
}

.dynamic-state__icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--tab-color-border-dark, #c9cdd4);
  border-radius: 50%;
  color: var(--tab-color-text-disabled, #86909c);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.dynamic-state__empty {
  width: 18px;
  height: 12px;
  border: 1px solid var(--tab-color-border-dark, #c9cdd4);
  border-radius: var(--tab-radius-sm, 4px);
  background: var(--tab-color-bg-elevated, #fff);
  box-shadow: inset 0 3px 0 var(--tab-color-bg-hover, #f2f3f5);
}

.dynamic-state__text {
  min-width: 0;
  color: inherit;
  font-weight: 400;
}

@keyframes dynamic-state-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>