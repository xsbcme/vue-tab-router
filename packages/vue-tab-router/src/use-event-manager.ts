import { EventManager } from "./event-manager";

export function useEventManager() {
  return EventManager.getInstance();
}
