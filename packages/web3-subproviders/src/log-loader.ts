import { TransactionLogger, TransactionLoggerEvents } from "./tx-logger";
import { resolve } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { LogRecord } from "./types";

export class TransactionLogFileLoader {
    readonly logfilePath: string;
    readonly txLogger: TransactionLogger;

    constructor(logfile: string) {
        this.logfilePath = resolve(logfile);

        if (!existsSync(this.logfilePath)) {
            writeFileSync(this.logfilePath, "[]", { encoding: "utf8" });
        }

        const logContent = readFileSync(this.logfilePath, { encoding: "utf8" });
        const logs = JSON.parse(logContent, undefined) as LogRecord[];

        console.log(`loader: loaded ${logs.join(":::")} ${this.logfilePath}`)

        this.txLogger = new TransactionLogger(logs);

        // tslint:disable-next-line:no-this-assignment
        const self = this;
        this.txLogger.on(TransactionLoggerEvents.LogChanged, (args) => {
            writeFileSync(self.logfilePath, JSON.stringify(self.txLogger.logs, undefined, "\t"), { encoding: "utf8" });
        });
    }
}
