import { createRouter, createWebHashHistory } from "vue-router";
import LoginLayout from "../../layouts/login/index.vue";
import ContainerLayout from "../../layouts/container/index.vue";
import OverviewPage from "../../views/overview-page.vue";
import CustomerPage from "../../views/customer-page.vue";
import OrderPage from "../../views/order-page.vue";
import OrderDetailPage from "../../views/order-detail-page.vue";
import ReportPage from "../../views/report-page.vue";

const router = createRouter({
  history: createWebHashHistory("./"),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginLayout,
      meta: {
        tab: false,
      },
    },
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/workbench",
      component: ContainerLayout,
      redirect: "/workbench/overview",
      children: [
        {
          path: "overview",
          name: "overview",
          component: OverviewPage,
          meta: {
            tab: {
              title: "适配层总览",
              closable: false,
            },
          },
        },
        {
          path: "customers",
          name: "customers",
          component: CustomerPage,
          meta: {
            tab: {
              title: "客户工作台",
            },
          },
        },
        {
          path: "orders",
          name: "orders",
          component: OrderPage,
          meta: {
            tab: {
              title: "订单中心",
            },
          },
        },
        {
          path: "orders/:id",
          name: "order-detail",
          component: OrderDetailPage,
          meta: {
            tab: {
              title: route => `订单 ${String(route.params.id)}`,
              match: route => ({ name: route.name, id: route.params.id }),
            },
          },
        },
        {
          path: "reports/:period",
          name: "report-detail",
          component: ReportPage,
          meta: {
            tab: {
              title: route => `${String(route.params.period)} 报表`,
              match: "path",
              keepAlive: false,
            },
          },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      redirect: "/login",
      meta: {
        tab: false,
      },
    },
  ],
});

export default router;
