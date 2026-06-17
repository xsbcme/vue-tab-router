import { App } from "vue";
import ArcoVue from "@arco-design/web-vue";
import {
  IconApps,
  IconHome,
  IconMenuFold,
  IconMenuUnfold,
  IconPoweroff,
  IconRefresh,
  IconStorage,
} from "@arco-design/web-vue/es/icon";
import "@arco-design/web-vue/dist/arco.css";

export default {
  install(app: App) {
    app.use(ArcoVue);
    app.component("IconApps", IconApps);
    app.component("IconHome", IconHome);
    app.component("IconMenuFold", IconMenuFold);
    app.component("IconMenuUnfold", IconMenuUnfold);
    app.component("IconPoweroff", IconPoweroff);
    app.component("IconRefresh", IconRefresh);
    app.component("IconStorage", IconStorage);
  },
};
