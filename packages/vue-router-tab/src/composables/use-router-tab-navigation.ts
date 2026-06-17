import { useRouter } from "vue-router";
import type { RouteLocationRaw } from "vue-router";

export function useRouterTabNavigation() {
  const router = useRouter();
  return {
    router,
    open: (to: RouteLocationRaw) => router.push(to),
    replace: (to: RouteLocationRaw) => router.replace(to),
  };
}
