import { defineComponent, h } from "vue";
import { DynamicContainerComponent } from "@xsbcme/vue-tab-router";

export const RouterTabsView = defineComponent({
  name: "RouterTabsView",
  setup() {
    return () => h(DynamicContainerComponent);
  },
});
