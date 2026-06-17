import { createApp } from "vue";
import App from "./App.vue";
import arco from "./plugins/arco";
import tabsManager from "./plugins/tab-router";
import router from "./plugins/vue-router";

const run = async () => {
  const app = createApp(App).use(arco).use(router).use(tabsManager);
  await router.isReady();
  app.mount("#app");
};

run().catch(error => {
  console.error(error);
});
