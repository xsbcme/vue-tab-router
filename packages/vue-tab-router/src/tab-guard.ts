import { Tab } from "./tab";
import { MaybeGuardReturn } from "./types";

export class TabGuardRejectError extends Error {
  constructor(message = "Tab guard rejected") {
    super(message);
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
