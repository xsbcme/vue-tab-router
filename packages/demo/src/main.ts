import { createApp } from "vue";
import App from "@/App.vue";

import arco from "@/plugins/arco";
import store from "@/plugins/store";
import vueRouter from "@/plugins/vue-router";
import tabRouter from "@/plugins/tab-router";

const run = async () => {
  const app = createApp(App).use(arco).use(store).use(vueRouter).use(tabRouter);
  await vueRouter.isReady();
  app.mount("#app");
};

run().catch(err => {
  console.error(err);
});
