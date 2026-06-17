import { defineComponent, h } from "vue";
import { DynamicContainerComponent, DynamicTabsComponent } from "@xsbcme/vue-tab-router";

export const RouterTabsContainer = defineComponent({
  name: "RouterTabsContainer",
  setup(_props, { slots }) {
    return () =>
      h("div", { class: "router-tabs-container" }, [
        slots.start?.(),
        h(DynamicTabsComponent),
        h("div", { class: "router-tabs-container__body" }, [h(DynamicContainerComponent)]),
        slots.end?.(),
      ]);
  },
});
