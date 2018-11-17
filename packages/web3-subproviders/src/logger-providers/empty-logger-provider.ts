import { TransactionLogger } from "../tx-logger";
import { LoggerProvider } from "./abstract-logger-provider";

export class EmptyLoggerProvider extends LoggerProvider {

    constructor(public txLogger: TransactionLogger) {
        super(txLogger);
        this._changedEventListener = () => {
            if (this.txLogger.logs.length !== 0) {
                this.txLogger.logs = [];
            }
        };
        this._subscribeOnLoggerChanged();
    }
}
