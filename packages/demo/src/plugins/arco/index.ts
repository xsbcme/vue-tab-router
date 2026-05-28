import { App } from "vue";
import ArcoVue from "@arco-design/web-vue";
import "@arco-design/web-vue/dist/arco.css";

export default {
  install(app: App) {
    app.use(ArcoVue);
  },
};
