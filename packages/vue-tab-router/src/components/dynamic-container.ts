import { createVNode, Transition, defineComponent, provide, computed, resolveComponent } from 'vue';
import { INJECT_ACTIVE_TAB_KEY, INJECT_CURRENT_TAB_KEY, PEALTIVE_VIEW_URL_PREFIX_KEY, } from '@/constant';
import { clone, isHttpUrl } from '@/utils';
import { useTabsManager } from '@/use-tabs-manager';

import { default as KeepAliveEnhanceComponent } from '@/components/keep-alive-enhance';
import DynamicIframeComponent from '@/components/dynamic-iframe.vue';

export default defineComponent({
    name: 'DynamicContainer',
    setup() {

        const tabsManager = useTabsManager();
        const {
            transitionProps,
            keepAliveProps,
            noActiveComponent,
            onIframeLoad
        } = tabsManager.options || {};

        const getKeepTabKeys = computed<string[]>(() => {
            const keepTabIds = tabsManager.tabs
                .filter(item => !item._noCahce && !item._isRefresh)
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
                    return () => createVNode('div', null, '不存在激活的标签页，请检查菜单是否配置并激活！');
                }

                provide(INJECT_CURRENT_TAB_KEY, activeTab);

                // activeTab._loading

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
                            onIframeLoad && onIframeLoad(e, activeTab);
                        }
                    });
                }

                return () => createVNode(resolveComponent(activeTab.viewUrl), {
                    ...clone(activeTab.viewProps || {}),
                });
            }
        });

        const keepAliveRender = () => createVNode(KeepAliveEnhanceComponent, {
            ...keepAliveProps,
            includeKey: getKeepTabKeys.value
        }, () => tabsManager.activeTab?._isRefresh ? null : createVNode(dynamicComponent, { key: tabsManager.activeTab?._id }));

        const transitionRender = () => createVNode(Transition, {
            appear: true,
            mode: 'out-in',
            ...transitionProps,
        }, { default: keepAliveRender })

        return () => !tabsManager.refreshAllTabFlag ? (transitionProps?.name ? transitionRender : keepAliveRender)() : null;

    },
});
