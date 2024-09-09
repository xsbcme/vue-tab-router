import { TabGuard, TabGuardName } from "./types";

export class Tab {

    _id!: string;
    _sourceId?: string;
    _isRefresh?: boolean;
    _isActive?: boolean;
    _noClose?: boolean;
    _isFirst?: boolean;
    _single?: boolean;
    _noCahce?: boolean;
    _loading?: boolean;
    _onBeforeTabOpen?: TabGuard;
    _onBeforeTabEnter?: TabGuard;
    _onBeforeTabLeave?: TabGuard;
    _onBeforeTabClose?: TabGuard;

    viewName?: string;
    viewIcon?: string;
    viewUrl!: string;
    viewProps?: Record<string, any>;

    constructor(options?: Omit<Tab, TabGuardName>) {
        Object.assign(this, options || {});
    }


}