<template>
    <div class="truncated-text" :title="fullText">
        {{ displayText }}
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 定义组件props
interface Props {
    text: string
    maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
    text: '',
    maxLength: 50
})

// 计算完整文本
const fullText = computed(() => props.text)

// 计算是否需要截断
const isTruncated = computed(() => props.text.length > props.maxLength)

// 计算显示的文本
const displayText = computed(() => {
    if (!isTruncated.value) {
        return props.text
    }

    // 计算前后各保留的字符数
    const keepLength = Math.floor((props.maxLength - 3) / 2)
    const start = props.text.substring(0, keepLength)
    const end = props.text.substring(props.text.length - keepLength)

    return `${start}...${end}`
})
</script>

<style lang="scss" scoped>
.truncated-text {
    display: inline-block;
    cursor: pointer;
}
</style>