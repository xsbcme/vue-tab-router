import { useTabsManager } from "./use-tabs-manager";

export function useEventManager() {
  return useTabsManager().events;
}
