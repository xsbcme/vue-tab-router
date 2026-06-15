import { PersistedTab, TabCloseGuard, TabEnterGuard, TabLeaveGuard } from "../types";

export class Tab {
  _id!: string;
  _sourceId?: string;
  _isRefresh?: boolean;
  _isActive?: boolean;
  _noClose?: boolean;
  _noDrag?: boolean;
  _isFirst?: boolean;
  _pinned?: boolean;
  _single?: boolean;
  _noCache?: boolean;
  _loading?: boolean;
  _onBeforeTabEnter?: TabEnterGuard;
  _onBeforeTabLeave?: TabLeaveGuard;
  _onBeforeTabClose?: TabCloseGuard;

  viewName?: string;
  viewIcon?: string;
  viewUrl!: string;
  viewProps?: Record<string, unknown>;

  constructor(options?: Partial<PersistedTab>) {
    Object.assign(this, options || {});
  }

  toJSON(): PersistedTab {
    return {
      _id: this._id,
      _sourceId: this._sourceId,
      _isActive: this._isActive,
      _noClose: this._noClose,
      _noDrag: this._noDrag,
      _isFirst: this._isFirst,
      _pinned: this._pinned,
      _single: this._single,
      _noCache: this._noCache,
      viewName: this.viewName,
      viewIcon: this.viewIcon,
      viewUrl: this.viewUrl,
      viewProps: this.viewProps,
    };
  }
}
