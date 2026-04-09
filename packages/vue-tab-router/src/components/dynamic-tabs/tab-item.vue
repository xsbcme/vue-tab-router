<template>
    <div
        class="tabs-nav__item"
        :class="{ 'is-active': isActive }"
        @click="emit('select', tab._id)"
        @contextmenu.prevent="(e) => emit('contextmenu', e, tab)"
    >
        <div class="tabs-title">
            <template v-if="showIcon && (tab.viewIcon || defaultIcon)">
                <dynamic-icon width="16px" height="16px" :icon="tab.viewIcon || defaultIcon" />
            </template>
            <TruncatedText
                :text="tab._loading ? '加载中...' : (tab.viewName || '未命名')"
                :max-length="maxNameLength"
            />
        </div>
        <span v-if="!tab._noClose" class="tabs-nav__close" @click.stop="emit('close', tab._id)">
            <svg viewBox="0 0 1024 1024" width="12" height="12" fill="currentColor">
                <path d="M195.2 195.2a42.667 42.667 0 0 1 60.267 0L512 451.733l256.533-256.533a42.667 42.667 0 0 1 60.267 60.267L572.267 512l256.533 256.533a42.667 42.667 0 0 1-60.267 60.267L512 572.267 255.467 828.8a42.667 42.667 0 0 1-60.267-60.267L451.733 512 195.2 255.467a42.667 42.667 0 0 1 0-60.267z" />
            </svg>
        </span>
    </div>
</template>

<script lang="ts" setup>
import { Tab } from '@/tab';
import TruncatedText from './truncated-text.vue';
import DynamicIcon from '../dynamic-icon.vue';

defineProps<{
    tab: Tab;
    isActive: boolean;
    showIcon: boolean;
    defaultIcon?: string;
    maxNameLength?: number;
}>();

const emit = defineEmits<{
    (e: 'select', id: string): void;
    (e: 'close', id: string): void;
    (e: 'contextmenu', event: MouseEvent, tab: Tab): void;
}>();
</script>

<style lang="scss" scoped>
.tabs-title {
    display: flex;
    align-items: center;
    gap: 4px;
}

.tabs-nav__item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, color 0.15s;
    color: var(--color-text-2, #4e5969);
    font-size: 14px;
    flex-shrink: 0;

    &:hover {
        background: var(--color-fill-2, #f2f3f5);
        color: var(--color-text-1, #1d2129);
    }

    &.is-active {
        background: var(--color-fill-3, #e5e6eb);
        color: var(--color-text-1, #1d2129);
        font-weight: 500;
    }
}

.tabs-nav__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    color: var(--color-text-3, #86909c);
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;

    &:hover {
        background: var(--color-fill-4, #c9cdd4);
        color: var(--color-text-1, #1d2129);
    }
}
</style>
