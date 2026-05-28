import { createRouter, createWebHashHistory } from "vue-router";
import { useUserStore } from "@/plugins/store";

import ContainerComponent from "@/layouts/container/index.vue";
import LoginComponent from "@/layouts/login/index.vue";

const router = createRouter({
  history: createWebHashHistory("./"),
  routes: [
    {
      path: "/login",
      component: LoginComponent,
    },
    {
      path: "/dashboard",
      component: ContainerComponent,
      meta: {
        accessAuth: true,
      },
    },
    {
      path: "/:catchAll(.*)",
      redirect: "/login",
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  if (to.meta?.accessAuth && !userStore.getToken) {
    return next("/login");
  }
  return next();
});

export default router;
