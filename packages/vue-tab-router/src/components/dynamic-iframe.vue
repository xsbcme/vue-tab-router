<template>
    <div class="dynamic-iframe">
        <iframe class="dynamic-iframe-content" :src="getUrl" @load="onLoad">
            您的浏览器不支持内联框架
        </iframe>
        <template v-if="loading">
            <div class="dynamic-iframe-loading">内联框架加载中...</div>
        </template>
    </div>
</template>

<script setup lang="ts" >
import { computed, toRefs, nextTick, shallowRef } from 'vue';

defineOptions({
    name: 'DynamicIframe'
});

const emit = defineEmits<{
    load: [e: Event];
}>();

const props = withDefaults(defineProps<{
    link: string;
    linkProps?: Record<string, any>;
}>(), {
    linkProps: () => ({})
});
const { link, linkProps } = toRefs(props);

const loading = shallowRef(true);

const getUrl = computed(() => {
    const queryParams = Object.assign({}, formatUrlToQueryObject(link.value), linkProps.value);
    let rawLink = link.value;
    if (Object.keys(queryParams).length > 0) {
        const findQueryIndex = link.value.indexOf('?');
        if (findQueryIndex >= 0) {
            rawLink = rawLink.substring(0, findQueryIndex);
        }
        rawLink = rawLink + '?' + formatObjectToQueryString(queryParams);
    }
    return rawLink;
});

const formatUrlToQueryObject = (url: string) => {
    if (url.indexOf('?') < 0) return {};
    url = url.substring(url.indexOf('?') + 1);
    return url.split('&').reduce((pre, cur) => {
        const [k, v] = cur.split('=').map(decodeURIComponent);
        pre[k] = v;
        return pre;
    }, {} as Record<string, any>);
}

const formatObjectToQueryString = (obj: Record<string, any>) => {
    return Object.keys(obj).map(key => key + '=' + encodeURIComponent(obj[key])).join('&');
}

const onLoad = (e: Event) => {
    loading.value = false;
    nextTick(() => {
        emit('load', e);
        // const iframe = e.target as HTMLIFrameElement;
        // const iframeDocument = iframe.contentDocument;
        // if (iframeDocument) {
        //     const head = iframeDocument.querySelector('head');
        //     if (head) {
        //         const style = document.createElement('style');
        //         style.innerHTML = `
        //             body {
        //                 margin: 0;
        //                 padding: 0;
        //                 height: 100%;
        //                 width: 100%;
        //             }
        //         `;
        //         head.appendChild(style);
        //     }
        // }
    });
}
</script>

<style lang="scss" scoped>
.dynamic-iframe {
    width: 100%;
    height: 100%;
    position: relative;

    &-content {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
        overflow: hidden;
    }

    &-loading {
        position: absolute;
        top: 0;
        left: 0;
    }
}
</style>
