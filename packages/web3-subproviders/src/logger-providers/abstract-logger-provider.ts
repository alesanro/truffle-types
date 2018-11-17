import { TransactionLogger, TransactionLoggerEvents } from "../tx-logger";

export abstract class LoggerProvider {

    protected _changedEventListener: (() => void)|null;
    private _invalidated = false;

    constructor(public txLogger: TransactionLogger) {
        // tslint:disable-next-line:no-null-keyword
        this._changedEventListener = null;
    }

    protected _subscribeOnLoggerChanged() {
        if (this._changedEventListener) {
            this.txLogger.on(TransactionLoggerEvents.LogChanged, this._changedEventListener);
        }
    }

    invalidate(): void {
        if (!this._invalidated) {
            this._invalidated = true;
            if (this._changedEventListener) {
                this.txLogger.removeListener(TransactionLoggerEvents.LogChanged, this._changedEventListener);
            }
        }
    }
}
