<template>
    <template v-if="isHtmlTag(icon)">
        <span v-html="icon" />
    </template>
    <template v-else-if="isImagePath(icon) || isBase64Image(icon)">
        <img class="dynamic-icon" :src="icon" />
    </template>
    <template v-else>
        <Component :is="icon" />
    </template>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { IconApps } from '@arco-design/web-vue/es/icon';

defineOptions({
    components: {
        IconApps
    }
});

const props = defineProps<{
    icon: string;
}>();
const { icon } = toRefs(props);

// '<svg></svg>'
const isHtmlTag = (str: string) => {
    return /<[a-z][\s\S]*>/i.test(str);
}

// (./a.png || /a.png) || (http://a/a.png || https://a/a.png)
const isImagePath = (str: string) => {
    return /\.(png|jpe?g|gif|svg)(\?.*)?$/.test(str);
}

// data:image/png;base64, 
const isBase64Image = (str: string) => {
    return str.startsWith('data:image');
}

</script>

<style lang="scss" scoped>
.dynamic-icon {
    width: 14px;
    height: 14px;
}
</style>