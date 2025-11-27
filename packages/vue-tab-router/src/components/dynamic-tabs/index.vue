<template>
    <div class="tabs">
        <a-tabs :activeKey="tabsManager.activeTab?._id" :type="type" editable hideContent @delete="handleCloseTab"
            @tabClick="handleSelectTab">
            <template v-for="tab in tabsManager.tabs" :key="tab._id">
                <a-tab-pane :closable="!tab._noClose">
                    <template #title>
                        <a-dropdown trigger="contextMenu" :popup-max-height="false" alignPoint
                            @select="(eventName) => handleSelectDropdown(eventName as string, tab)">
                            <div class="tabs-title">
                                <template v-if="showIcon && (tab.viewIcon || defaultIcon)">
                                    <dynamic-icon width="16px" height="16px" :icon="tab.viewIcon || defaultIcon" />
                                </template>
                                <TruncatedText :text="tab._loading ? '加载中...' : (tab.viewName || '未命名')"
                                    :max-length="tabsManager?.options?.viewNameMaxLength" />
                            </div>
                            <template #content>
                                <a-doption value="refresh">
                                    <template #icon>
                                        <icon-refresh />
                                    </template>
                                    刷新此页
                                </a-doption>
                                <a-doption value="close-left">
                                    <template #icon>
                                        <icon-arrow-left />
                                    </template>
                                    关闭左侧
                                </a-doption>
                                <a-doption value="close-right">
                                    <template #icon>
                                        <icon-arrow-right />
                                    </template>
                                    关闭右侧
                                </a-doption>
                                <a-doption value="close-other">
                                    <template #icon>
                                        <icon-close />
                                    </template>
                                    关闭其他
                                </a-doption>
                                <a-doption value="close-all">
                                    <template #icon>
                                        <icon-folder-delete />
                                    </template>
                                    全部关闭
                                </a-doption>
                                <a-doption value="refresh-all">
                                    <template #icon>
                                        <icon-refresh />
                                    </template>
                                    全部刷新
                                </a-doption>
                            </template>
                        </a-dropdown>
                    </template>
                </a-tab-pane>
            </template>
        </a-tabs>
    </div>
</template>
<script lang="ts" setup>
import type { TabsType } from '@arco-design/web-vue/es/tabs/interface';
import { Tab } from '@/tab';
// import '@arco-design/web-vue/es/tabs/style/index';
import Tabs, { TabPane } from '@arco-design/web-vue/es/tabs';
// import '@arco-design/web-vue/es/dropdown/style/index';
import Dropdown, { Doption } from '@arco-design/web-vue/es/dropdown';
import TruncatedText from './truncated-text.vue';
// import '@arco-design/web-vue/es/trigger/style/index';

import {
    IconRefresh,
    IconArrowLeft,
    IconArrowRight,
    IconClose,
    IconFolderDelete,
} from '@arco-design/web-vue/es/icon';
import DynamicIcon from '../dynamic-icon.vue';
import { useTabsManager } from '@/use-tabs-manager';

defineOptions({
    components: {
        ATabs: Tabs,
        ATabPane: TabPane,
        ADropdown: Dropdown,
        ADoption: Doption
    }
});


withDefaults(defineProps<{
    type?: TabsType;
    showIcon?: boolean;
    defaultIcon?: string;
}>(), {
    type: 'text'
});

// const emit = defineEmits<{
//     (event: 'selectTab', tab: Tab, index: number): void;
//     (event: 'closeTab', tab: Tab, index: number): void;
//     (event: 'selectDropdown', eventName: string, tab: Tab, index: number): void;
// }>();

// const handleSelectTab = (key: string) => {
//     const findIndex = tabs.value.findIndex(tab => tab._id === key);
//     if (findIndex >= 0) {
//         emit('selectTab', tabs.value[findIndex], findIndex);
//     }
// }

// const handleCloseTab = (key: string) => {
//     const findIndex = tabs.value.findIndex(tab => tab._id === key);
//     if (findIndex >= 0) {
//         emit('closeTab', tabs.value[findIndex], findIndex);
//     }
// }

// const handleSelectSropdown = (eventName: string, tab: Tab, index: number) => {
//     emit('selectDropdown', eventName, tab, index);
// }


const tabsManager = useTabsManager();

const handleSelectTab = (key: string) => {
    const findIndex = tabsManager.tabs.findIndex(tab => tab._id === key);
    if (findIndex >= 0) {
        const tab = tabsManager.tabs[findIndex];
        tabsManager.openTab(tab.viewUrl, tab.viewProps);
    }
}

const handleCloseTab = (key: string) => {
    const findIndex = tabsManager.tabs.findIndex(tab => tab._id === key);
    if (findIndex >= 0) {
        const tab = tabsManager.tabs[findIndex];
        tabsManager.closeTab(tab._id);
    }
}

const handleSelectDropdown = (eventName: string, tab: Tab) => {
    switch (eventName) {
        case 'refresh':
            tabsManager.refreshTab(tab._id);
            break;
        case 'close-left':
            tabsManager.closeTabsByLeft(tab._id);
            break;
        case 'close-right':
            tabsManager.closeTabsByRight(tab._id);
            break;
        case 'close-other':
            tabsManager.closeTabsByOther(tab._id);
            break;
        case 'close-all':
            tabsManager.closeTabByAll();
            break;
        case 'refresh-all':
            tabsManager.refreshTabAll();
            break;
        default:
            break;
    }
}



</script>
<style lang="scss" scoped>
.tabs {
    // background-color: var(--color-bg-2);
    padding: 4px;
    // border-bottom: 1px solid var(--color-border);
    width: 100%;
    user-select: none;

    &-title {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    // :deep(.arco-tag-checkable) {
    //    background-color: var(--color-fill-2);
    //}

    :deep(.arco-scrollbar-track) {
        height: 4px;

    }

    :deep(.arco-scrollbar-thumb-bar) {
        height: 4px;
        margin: 0;
    }
}
</style>