import { computed, defineComponent, h } from "vue";
import { RouterLink } from "vue-router";
import type { RouteLocationRaw } from "vue-router";

export const RouterTabsLink = defineComponent({
  name: "RouterTabsLink",
  props: {
    to: {
      type: [String, Object] as unknown as () => RouteLocationRaw,
      required: true,
    },
    replace: Boolean,
    custom: Boolean,
  },
  setup(props, { slots }) {
    const to = computed(() => props.to);
    return () => h(RouterLink, { to: to.value, replace: props.replace, custom: props.custom }, slots);
  },
});
