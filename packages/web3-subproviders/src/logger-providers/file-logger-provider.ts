import { resolve } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { LoggerProvider } from "./abstract-logger-provider";
import { TransactionLogger } from "../tx-logger";
import { LogRecord } from "../types";
import { createPathSync } from "../utils/create-path";

export class FileLoggerProvider extends LoggerProvider {
    readonly logfilePath: string;

    constructor(logfile: string, readonly txLogger: TransactionLogger) {
        super(txLogger);

        createPathSync(logfile);
        this.logfilePath = resolve(logfile);

        if (!existsSync(this.logfilePath)) {
            writeFileSync(this.logfilePath, "[]", { encoding: "utf8" });
        }


        const logContent = readFileSync(this.logfilePath, { encoding: "utf8" });
        const logs = JSON.parse(logContent, undefined) as LogRecord[];

        console.log(`loader: loaded ${logs.join(":::")} ${this.logfilePath}`)

        this.txLogger.logs = logs;

        // tslint:disable-next-line:no-this-assignment
        const self = this;
        this._changedEventListener = () => {
            writeFileSync(self.logfilePath, JSON.stringify(self.txLogger.logs, undefined, "\t"), { encoding: "utf8" });
        };

        this._subscribeOnLoggerChanged();
    }
}
