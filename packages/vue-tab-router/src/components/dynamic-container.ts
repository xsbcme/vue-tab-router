import { createVNode, Transition, defineComponent, provide, computed, getCurrentInstance } from 'vue';
import { INJECT_ACTIVE_TAB_KEY, INJECT_CURRENT_TAB_KEY, PEALTIVE_VIEW_URL_PREFIX_KEY, } from '@/constant';
import { clone, findVueComponent, isHttpUrl } from '@/utils';
import { useTabsManager } from '@/use-tabs-manager';

import { default as KeepAliveEnhanceComponent } from '@/components/keep-alive-enhance';
import DynamicIframeComponent from '@/components/dynamic-iframe.vue';

export default defineComponent({
    name: 'DynamicContainer',
    setup() {

        const instance = getCurrentInstance();
        const tabsManager = useTabsManager();
        const {
            transitionProps,
            keepAliveProps,
            noActiveComponent,
            noExistComponent,
            onIframeLoad
        } = tabsManager.options || {};

        const getKeepTabKeys = computed<string[]>(() => {
            const keepTabIds = tabsManager.tabs
                .filter(item => !item._noCache && !item._isRefresh)
                .map(item => item._id) as string[];
            return [...new Set(keepTabIds)];
        });

        provide(INJECT_ACTIVE_TAB_KEY, computed(() => tabsManager.activeTab));

        const dynamicComponent = defineComponent({
            name: 'DynamicComponent',
            setup() {

                const activeTab = tabsManager.activeTab;
                if (!activeTab) {
                    if (noActiveComponent) {
                        return () => createVNode(noActiveComponent);
                    }
                    return () => null;
                }

                // activeTab._loading = true;

                provide(INJECT_CURRENT_TAB_KEY, activeTab);

                if (activeTab.viewUrl.startsWith(PEALTIVE_VIEW_URL_PREFIX_KEY) || isHttpUrl(activeTab.viewUrl)) {
                    let viewUrl = '';
                    if (activeTab.viewUrl.startsWith(PEALTIVE_VIEW_URL_PREFIX_KEY)) {
                        viewUrl = activeTab.viewUrl.replace(PEALTIVE_VIEW_URL_PREFIX_KEY, '');
                    } else {
                        viewUrl = activeTab.viewUrl;
                    }
                    return () => createVNode(DynamicIframeComponent, {
                        key: activeTab._id,
                        link: viewUrl,
                        linkProps: activeTab.viewProps,
                        onLoad: (e: Event) => {
                            onIframeLoad && onIframeLoad(e, clone(activeTab));
                            // activeTab._loading = undefined;
                        }
                    });
                }

                const comp = findVueComponent(instance, activeTab.viewUrl);
                if (!comp) {
                    if (noExistComponent) {
                        return () => createVNode(noExistComponent);
                    }
                    return () => createVNode('div', null, '此页面不存在！');
                }
                // todo 创建dom容器记录滚动条位置
                return () => createVNode(comp, {
                    ...clone(activeTab.viewProps || {}),
                    onVnodeMounted() {
                        // activeTab._loading = undefined;
                    }
                });
            }
        });

        const keepAliveRender = () => createVNode(KeepAliveEnhanceComponent, {
            ...keepAliveProps,
            includeKey: getKeepTabKeys.value,
        }, () => tabsManager.activeTab?._isRefresh ? null : createVNode(dynamicComponent, { key: tabsManager.activeTab?._id }));
        const transitionRender = () => createVNode(Transition, {
            appear: true,
            mode: 'out-in',
            ...transitionProps,
        }, { default: keepAliveRender })
        return () => !tabsManager.refreshAllTabFlag ? (transitionProps?.name ? transitionRender : keepAliveRender)() : null;

    },
});
