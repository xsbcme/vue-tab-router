<template>
    <div class="tabbar">
        <a-tabs :activeKey="activeTab?._id" :type="type" editable hideContent @delete="handleCloseTab"
            @tabClick="handleSelectTab">
            <template v-for="(tab, index) in tabs" :key="tab._id">
                <a-tab-pane :closable="!tab._noClose">
                    <template #title>
                        <a-dropdown trigger="contextMenu" :popup-max-height="false"
                            @select="(eventName) => handleSelectSropdown(eventName as string, tab, index)">
                            <div>
                                <template v-if="showIcon && (tab.viewIcon || defaultIcon)">
                                    <dynamic-icon :icon="tab.viewIcon || defaultIcon" :style="{ marginRight: '2px' }" />
                                </template>
                                <span>{{ tab.viewName || '未命名' }}</span>
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
import { toRefs } from 'vue';
import type { TabsType } from '@arco-design/web-vue/es/tabs/interface';
import { Tab } from '@/tab';
import '@arco-design/web-vue/es/tabs/style/index.css';
import Tabs, { TabPane } from '@arco-design/web-vue/es/tabs';
import '@arco-design/web-vue/es/dropdown/style/index.css';
import Dropdown, { Doption } from '@arco-design/web-vue/es/dropdown';

defineOptions({
    components: {
        ATabs: Tabs,
        ATabPane: TabPane,
        ADropdown: Dropdown,
        ADoption: Doption
    }
});

import {
    IconRefresh,
    IconArrowLeft,
    IconArrowRight,
    IconClose,
    IconFolderDelete,
} from '@arco-design/web-vue/es/icon';

import DynamicIcon from '../dynamic-icon.vue';

const emit = defineEmits<{
    (event: 'selectTab', tab: Tab, index: number): void;
    (event: 'closeTab', tab: Tab, index: number): void;
    (event: 'selectDropdown', eventName: string, tab: Tab, index: number): void;
}>();

const props = withDefaults(defineProps<{
    tabs: Tab[];
    activeTab?: Tab;
    type?: TabsType;
    showIcon?: boolean;
    defaultIcon?: string;
}>(), {
    type: 'text'
});

const { tabs, activeTab } = toRefs(props);

const handleSelectTab = (key: string) => {
    const findIndex = tabs.value.findIndex(tab => tab._id === key);
    if (findIndex >= 0) {
        emit('selectTab', tabs.value[findIndex], findIndex);
    }
}

const handleCloseTab = (key: string) => {
    const findIndex = tabs.value.findIndex(tab => tab._id === key);
    if (findIndex >= 0) {
        emit('closeTab', tabs.value[findIndex], findIndex);
    }
}

const handleSelectSropdown = (eventName: string, tab: Tab, index: number) => {
    emit('selectDropdown', eventName, tab, index);
}
</script>
<style lang="scss" scoped>
.tabbar {
    // background-color: var(--color-bg-2);
    padding: 4px;
    // border-bottom: 1px solid var(--color-border);
    width: 100%;
    user-select: none;

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