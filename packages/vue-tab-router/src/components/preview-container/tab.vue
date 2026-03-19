<template>
    <div class="tabs">
        <template v-for="tab in getTabs">
            <div :class="['tabs-item', { 'tabs-item-active': tab._isActive }]" @click.stop="handleSelectTab(tab)">
                <span>{{ tab.viewName }}</span>
                <template v-if="!tab._noClose">
                    <span class="tabs-item-close" @click.stop="handleCloseTab(tab)">×</span>
                </template>
            </div>
        </template>
    </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import { useTabsManager } from '../../use-tabs-manager';
import { Tab } from '../../tab';

const tabsManager = useTabsManager();

/** 预览模式下隐藏首页标签，避免与预览入口重复。 */
const getTabs = computed(() => tabsManager.tabs.filter(tab => !tab._isFirst));

const handleSelectTab = (tab: Tab) => {
    tabsManager.openTab(tab.viewUrl, tab.viewProps);
}

const handleCloseTab = (tab: Tab) => {
    tabsManager.closeTab(tab._id);
}
</script>
<style lang="scss" scoped>
.tabs {
    width: 100%;
    overflow: auto hidden;
    user-select: none;
    display: flex;
    gap: 8px;

    &-item {
        padding: 4px 8px;
        position: relative;
        border: 1px solid #E5E6EB;
        cursor: pointer;

        &-active {
            color: #165DFF;
        }

        &-close {
            margin-left: 4px;
        }
    }
}
</style>