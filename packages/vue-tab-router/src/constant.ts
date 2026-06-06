import { InjectionKey, ComputedRef } from "vue";
import { Tab } from "./tab";

export const STORAGE_TABS_KEY = "tabs";
export const INJECT_ACTIVE_TAB_KEY = Symbol("ActiveTab") as InjectionKey<ComputedRef<Tab | undefined>>;
export const INJECT_CURRENT_TAB_KEY = Symbol("CurrentTab") as InjectionKey<ComputedRef<Tab | undefined>>;
