import { LogRecord, Status } from "./types";
import { EventEmitter } from "events";
// tslint:disable-next-line:no-implicit-dependencies
import * as Web3 from "web3";
import { sha3 } from "web3-utils";

export enum TransactionLoggerEvents {
    LogAdded = "txLogAdded",
    LogUpdated = "txLogUpdated",
    LogRemoved = "txLogRemoved",
    LogCleaned = "txLogCleaned",
    LogChanged = "txLogChanged",
}

export class TransactionLogger extends EventEmitter {
    public logs: LogRecord[] = [];

    constructor(logs: LogRecord[] = []) {
        super();
    }

    findFirstLog(predicate: (record: LogRecord) => boolean): LogRecord|undefined {
        const foundIdx = this.findFirstLogIndex(predicate);
        if (foundIdx === -1) {
            return;
        }

        return this.logs[foundIdx];
    }

    findFirstLogIndex(predicate: (record: LogRecord) => boolean): number {
        return this.logs.findIndex(predicate);
    }

    getLog(txHashsum: string): LogRecord {
        const logRecord = this.findFirstLog(record => record.hashsum === txHashsum);

        if (!logRecord) {
            throw new Error(`[TransactionLogger:getLog] Cannot find log record with such hashsum. Use it only if you sure it exists`);
        }

        return logRecord;
    }

    checkLogExists(txHashsum: string): boolean {
        return !!this.findFirstLog(record => record.hashsum === txHashsum);
    }

    appendLogRecord(record: LogRecord): boolean {
        if (this.findFirstLog(other => record.txhash === other.txhash)) {
            console.info(`[TransactionLogger:appendLogRecord]: Already has a record with provided txhash ${record.txhash}`);
            return false;
        }

        this.logs.push(record);
        this.emit(TransactionLoggerEvents.LogAdded, record.txhash, record.status);
        this._emitLogChanged();
        return true;
    }

    appendLog(from: string, to: string, input: string, txhash: string, status: Status, tx: Partial<Web3.Transaction>): boolean {
        const newLogRecord: LogRecord = {
            from,
            to,
            input,
            txhash,
            status,
            hashsum: TransactionLogger.makeTxHashsum(from, to, input),
            tx,
            sig: input.length > 2 ? input.slice(2, 10) : undefined,
        };
        return this.appendLogRecord(newLogRecord);
    }

    updateLog(txhash: string, newStatus: Status): boolean {
        const logIndex = this.findFirstLogIndex(record => record.txhash === txhash);
        if (logIndex === -1) {
            console.info(`[TransactionLogger:updateLog]: Cannot update log record for a txhash ${txhash} that doesn't exist`);
            return false;
        }

        this.logs[logIndex].status = newStatus;

        this.emit(TransactionLoggerEvents.LogUpdated, txhash, newStatus);
        this._emitLogChanged();
        return true;
    }

    removeLog(txhash: string): void {
        this.logs = this.logs.filter(log => log.txhash !== txhash);
        this.emit(TransactionLoggerEvents.LogRemoved, txhash);
        this._emitLogChanged();
    }

    flush(): void {
        this.logs = [];
        this.emit(TransactionLoggerEvents.LogCleaned);
        this._emitLogChanged();
    }

    static makeTxHashsum(from: string, to: string, input: string): string {
        return sha3(from, to, input);
    }

    private _emitLogChanged(): void {
        this.emit(TransactionLoggerEvents.LogChanged);
    }
}
