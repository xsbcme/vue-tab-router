export const routeMenus = [
  { key: "overview", label: "适配层总览", to: "/workbench/overview", icon: "home" },
  { key: "customers", label: "客户工作台", to: "/workbench/customers", icon: "apps" },
  { key: "orders", label: "订单中心", to: "/workbench/orders", icon: "storage" },
  { key: "order-a1024", label: "订单详情 A1024", to: "/workbench/orders/A1024", icon: "storage" },
  { key: "report-weekly", label: "运营报表", to: "/workbench/reports/weekly", icon: "apps" },
] as const;
