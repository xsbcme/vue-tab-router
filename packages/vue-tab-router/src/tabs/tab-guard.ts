import { Tab } from "./tab";
import { MaybeGuardReturn } from "../types";
import { TabRouterError } from "../shared";

export class TabGuardRejectError extends TabRouterError {
  constructor(message = "Tab guard rejected") {
    super("GUARD_REJECTED", message);
    this.name = "TabGuardRejectError";
  }
}

export async function runTabGuard(
  guard: ((tab: Partial<Tab>, relatedTab?: Partial<Tab>) => MaybeGuardReturn) | undefined,
  tab: Partial<Tab>,
  relatedTab?: Partial<Tab>
) {
  if (typeof guard !== "function") return;
  const result = await guard(tab, relatedTab);
  if (result === false) {
    throw new TabGuardRejectError();
  }
}
