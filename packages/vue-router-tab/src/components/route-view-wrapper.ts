import { defineComponent, h } from "vue";
import { RouterView } from "vue-router";

export const RouteViewWrapper = defineComponent({
  name: "RouteViewWrapper",
  inheritAttrs: false,
  setup() {
    return () => h(RouterView);
  },
});
