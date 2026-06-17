import { App } from "vue";
import ArcoVue from "@arco-design/web-vue";
import { IconApps } from "@arco-design/web-vue/es/icon";
import "@arco-design/web-vue/dist/arco.css";

export default {
  install(app: App) {
    app.use(ArcoVue);
    app.component("IconApps", IconApps);
  },
};
