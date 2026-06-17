import type { IOpenTabOptions, IUpdateTabOptions } from "../../types";
import { jsonToObject, TabViewUrl } from "../../shared";
import type { Tab } from "../tab";

export interface TabViewMetaDefaults {
  title?: string;
  icon?: string;
  props?: Record<string, unknown>;
}

export interface NormalizedOpenTabOptions {
  viewOutside?: IOpenTabOptions["_viewOutside"];
  viewName?: string;
  viewIcon?: string;
  viewNoCache?: boolean;
  viewSingle?: boolean;
  viewPinned?: boolean;
  viewNoClose?: boolean;
  viewNoDrag?: boolean;
  viewProps: Record<string, unknown>;
}

export function normalizeOpenTabOptions(
  viewUrl: string,
  viewMeta: TabViewMetaDefaults | undefined,
  tabOptions?: IOpenTabOptions
): NormalizedOpenTabOptions {
  const iframeController = TabViewUrl.isIframeController(viewUrl)
    ? TabViewUrl.resolveIframeController(viewUrl)
    : undefined;
  const normalizedOptions = {
    ...(viewMeta?.props || {}),
    ...(iframeController?.props || {}),
    _viewName: viewMeta?.props?._viewName ?? iframeController?.props?._viewName ?? viewMeta?.title,
    _viewIcon: viewMeta?.props?._viewIcon ?? iframeController?.props?._viewIcon ?? viewMeta?.icon,
    ...jsonToObject(tabOptions || {}, {}),
  } as IOpenTabOptions;
  const {
    _viewOutside,
    _viewName,
    _viewIcon,
    _viewNoCache,
    _viewSingle,
    _viewPinned,
    _viewNoClose,
    _viewNoDrag,
    ...viewProps
  } = normalizedOptions;

  return {
    viewOutside: _viewOutside,
    viewName: _viewName,
    viewIcon: _viewIcon,
    viewNoCache: _viewNoCache,
    viewSingle: _viewSingle,
    viewPinned: _viewPinned,
    viewNoClose: _viewNoClose,
    viewNoDrag: _viewNoDrag,
    viewProps,
  };
}

export function normalizeUpdateTabOptions(tab: Tab, options: IUpdateTabOptions | string) {
  const parsedOptions = jsonToObject(options, {}) as IUpdateTabOptions;
  const {
    _viewName,
    _viewIcon,
    _viewUrl,
    _viewNoCache,
    _viewSingle,
    _viewPinned,
    _viewNoClose,
    _viewNoDrag,
    ...viewProps
  } = parsedOptions;

  return {
    viewName: _viewName ?? tab.viewName,
    viewIcon: _viewIcon ?? tab.viewIcon,
    viewUrl: _viewUrl ?? tab.viewUrl,
    viewProps: { ...tab.viewProps, ...viewProps },
    _noCache: _viewNoCache ?? tab._noCache,
    _single: _viewSingle ?? tab._single,
    _pinned: tab._isFirst ? tab._pinned : (_viewPinned ?? tab._pinned),
    _noClose: tab._isFirst ? true : (_viewNoClose ?? tab._noClose),
    _noDrag: tab._isFirst ? true : (_viewNoDrag ?? tab._noDrag),
  } satisfies Partial<Tab>;
}
