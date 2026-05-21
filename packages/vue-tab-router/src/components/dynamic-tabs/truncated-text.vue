<template>
  <div class="truncated-text" :title="props.text">
    {{ displayText }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  text: string;
  maxLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  text: "",
  maxLength: 20,
});

const displayText = computed(() => {
  if (props.text.length <= props.maxLength) {
    return props.text;
  }
  const keepLength = Math.floor((props.maxLength - 3) / 2);
  const start = props.text.substring(0, keepLength);
  const end = props.text.substring(props.text.length - keepLength);
  return `${start}...${end}`;
});
</script>

<style lang="scss" scoped>
.truncated-text {
  display: inline-block;
  cursor: pointer;
}
</style>
