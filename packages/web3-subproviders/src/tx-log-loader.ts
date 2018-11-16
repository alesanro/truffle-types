import { TransactionLogger, TransactionLoggerEvents } from "./tx-logger";
import { resolve } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { LogRecord } from "./types";

export class TransactionLogFileLoader {
    readonly logfilePath: string;

    private _listenerChangedEvent: () => void;
    private _invalidated = false;

    constructor(logfile: string, readonly txLogger: TransactionLogger) {
        this.logfilePath = resolve(logfile);

        if (!existsSync(this.logfilePath)) {
            writeFileSync(this.logfilePath, "[]", { encoding: "utf8" });
        }

        const logContent = readFileSync(this.logfilePath, { encoding: "utf8" });
        const logs = JSON.parse(logContent, undefined) as LogRecord[];

        console.log(`loader: loaded ${logs.join(":::")} ${this.logfilePath}`)

        this.txLogger = txLogger;
        this.txLogger.logs = logs;

        // tslint:disable-next-line:no-this-assignment
        const self = this;
        this._listenerChangedEvent = () => {
            writeFileSync(self.logfilePath, JSON.stringify(self.txLogger.logs, undefined, "\t"), { encoding: "utf8" });
        };

        this.txLogger.on(TransactionLoggerEvents.LogChanged, this._listenerChangedEvent);
    }

    invalidate(): void {
        if (!this._invalidated) {
            this._invalidated = true;
            this.txLogger.removeListener(TransactionLoggerEvents.LogChanged, this._listenerChangedEvent);
        }
    }
}
