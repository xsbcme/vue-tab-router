import { clone } from "../../shared";
import type { ITabsManagerOptions } from "../../types";
import type { Tab } from "../tab";
import { runTabGuard } from "../tab-guard";
import type { TabsManagerHooks } from "../tabs-manager-plugin";

export interface TabGuardPipelineRuntime {
  readonly options: ITabsManagerOptions;
  readonly hooks: TabsManagerHooks;
}

export async function runBeforeOpenGuards(
  runtime: TabGuardPipelineRuntime,
  openingTab: Partial<Tab>,
  sourceTab?: Partial<Tab>
) {
  await runTabGuard(runtime.options?.onBeforeTabOpen, clone(openingTab), clone(sourceTab));
  await runtime.hooks.call("tab:before-open", clone(openingTab), clone(sourceTab));
}

export async function runBeforeActiveChangeGuards(
  runtime: TabGuardPipelineRuntime,
  toTab: Partial<Tab>,
  fromTab?: Partial<Tab>
) {
  if (fromTab) {
    await runTabGuard(runtime.options?.onBeforeTabLeave, clone(toTab), clone(fromTab));
    await runTabGuard(fromTab._onBeforeTabLeave, clone(toTab), clone(fromTab));
  }
  await runTabGuard(runtime.options?.onBeforeTabEnter, clone(toTab), clone(fromTab));
  await runTabGuard(toTab._onBeforeTabEnter, clone(toTab), clone(fromTab));
  await runtime.hooks.call("tab:before-active-change", clone(toTab), clone(fromTab));
}

export async function runBeforeCloseGuards(
  runtime: TabGuardPipelineRuntime,
  closingTab: Partial<Tab>,
  sourceTab?: Partial<Tab>
) {
  await runTabGuard(closingTab._onBeforeTabClose, clone(closingTab), clone(sourceTab));
  await runTabGuard(runtime.options?.onBeforeTabClose, clone(closingTab), clone(sourceTab));
  await runtime.hooks.call("tab:before-close", clone(closingTab), clone(sourceTab));
}
