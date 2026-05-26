import { InjectionKey, ComputedRef } from "vue";
import { Tab } from "./tab";

export const STORAGE_TABS_KEY = "tabs";
export const INJECT_ACTIVE_TAB_KEY = Symbol("ActiveTab") as InjectionKey<ComputedRef<Tab | undefined>>;
export const INJECT_CURRENT_TAB_KEY = Symbol("CurrentTab") as InjectionKey<ComputedRef<Tab | undefined>>;
export const RELATIVE_VIEW_URL_PREFIX_KEY = "relative:";
/** @deprecated 拼写已修正，请使用 RELATIVE_VIEW_URL_PREFIX_KEY */
export const PEALTIVE_VIEW_URL_PREFIX_KEY = RELATIVE_VIEW_URL_PREFIX_KEY;
