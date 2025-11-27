<template>
    <slot :style="getIconStyle" :render="renderHtml">
        <template v-if="renderHtml">
            <div class="dynamic-icon" :style="getIconStyle" v-bind="$attrs" v-html="renderHtml"></div>
        </template>
        <template v-else>
            <div class="dynamic-icon" :style="getIconStyle" v-bind="$attrs">
                <slot name="empty"></slot>
            </div>
        </template>
    </slot>
</template>

<script setup lang="ts">
import { findVueComponent } from '@/utils';
import { shallowRef, watch, createVNode, render, getCurrentInstance, computed } from 'vue';

const props = defineProps<{
    icon: string | undefined;
    width?: number | string | undefined;
    height?: number | string | undefined;
}>();

const renderHtml = shallowRef<string>();
const instance = getCurrentInstance();

const getIconStyle = computed(() => {
    const style: Record<string, string | number> = {};
    if (props.width !== undefined) {
        style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    }
    if (props.height !== undefined) {
        style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }
    return style;
});

watch(() => props.icon, () => {
    renderIcon();
}, { immediate: true });

async function renderIcon() {
    const icon = props.icon || '';
    const component = findVueComponent(instance, icon);
    if (component && typeof component === 'object') {
        const div = document.createElement('div');
        render(createVNode(component), div);
        const htmlContent = div.innerHTML;
        render(null, div);
        if (htmlContent.includes('<svg')) {
            renderHtml.value = await processSvgString(htmlContent);
        } else {
            renderHtml.value = htmlContent;
        }
    } else if (isHtmlTag(icon)) {
        renderHtml.value = await processSvgString(icon);
    } else if (isImagePath(icon) || isBase64Image(icon)) {
        renderHtml.value = `<img style="width:100%;height:100%;object-fit:contain;" src="${icon}" />`;
    } else {

    }
}

// '<svg></svg>'
function isHtmlTag(str: string) {
    return /<[a-z][\s\S]*>/i.test(str);
}

// (./a.png || /a.png) || (http://a/a.png || https://a/a.png)
function isImagePath(str: string) {
    return /\.(png|jpe?g|gif|svg)(\?.*)?$/.test(str);
}

// data:image/png;base64, 
function isBase64Image(str: string) {
    return str.startsWith('data:image');
}

function calculateViewBoxFromSvgString(svgString: string) {
    return new Promise<string>((resolve) => {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.innerHTML = svgString.trim();
        const svgElement = tempDiv.querySelector('svg');
        const paths = svgElement.querySelectorAll('path');
        document.body.appendChild(tempDiv);

        requestAnimationFrame(() => {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            paths.forEach(path => {
                const bbox = path.getBBox();
                if (path.hasAttribute('transform')) {
                    try {
                        const transformedBBox = path.getBoundingClientRect();
                        const svgRect = svgElement.getBoundingClientRect();
                        const x = transformedBBox.left - svgRect.left;
                        const y = transformedBBox.top - svgRect.top;
                        const width = transformedBBox.width;
                        const height = transformedBBox.height;
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x + width);
                        maxY = Math.max(maxY, y + height);
                    } catch (e) {
                        minX = Math.min(minX, bbox.x);
                        minY = Math.min(minY, bbox.y);
                        maxX = Math.max(maxX, bbox.x + bbox.width);
                        maxY = Math.max(maxY, bbox.y + bbox.height);
                    }
                } else {
                    minX = Math.min(minX, bbox.x);
                    minY = Math.min(minY, bbox.y);
                    maxX = Math.max(maxX, bbox.x + bbox.width);
                    maxY = Math.max(maxY, bbox.y + bbox.height);
                }
            });
            document.body.removeChild(tempDiv);
            if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
                resolve(null);
                return;
            }
            resolve(`${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
        });
    });
}

async function processSvgString(svgString: string) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = svgString.trim();
    const svgElement = tempDiv.querySelector('svg');
    const viewBox = await calculateViewBoxFromSvgString(svgString);
    if (!svgElement.hasAttribute('viewBox')) {
        if (viewBox) {
            svgElement.setAttribute('viewBox', viewBox);
        } else {
            svgElement.setAttribute('viewBox', '0 0 100 100');
        }
    }
    svgElement.removeAttribute('class');
    svgElement.removeAttribute('style');
    svgElement.removeAttribute('width');
    svgElement.removeAttribute('height');
    return tempDiv.innerHTML;
}

</script>

<style lang="scss" scoped>
.dynamic-icon {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    >img {
        object-fit: contain;
    }
}
</style>