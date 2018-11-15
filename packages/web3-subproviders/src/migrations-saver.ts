import { PathLike } from "fs";
import SubProvider, { NextFunctionCallback, EndFunctionCallback } from "web3-provider-engine/subproviders/subprovider";
// tslint:disable-next-line:no-implicit-dependencies
import { JSONRPCRequestPayload } from "ethereum-protocol";
// tslint:disable-next-line:no-implicit-dependencies
import * as Web3 from "web3";
import { TransactionLogger } from "./tx-logger";
import { setInterval, clearInterval } from "timers";
import { LogRecord } from "./types";

const TRANSACTION_ALREADY_PENDING = "Transaction with the same hash was already imported.";

type WaitTxCallback = (err: Error|null, receipt: Web3.TransactionReceipt|null, status: number|null) => void;

function isPendingError(err: Error|null): boolean {
    return !!err && err.message === TRANSACTION_ALREADY_PENDING;
}

export class MigrationsSaverSubprovider extends SubProvider {
    constructor(readonly deployedAddressesPath: PathLike, public web3: Web3, public txLogger: TransactionLogger) {
        super();
    }

    public handleRequest(payload: JSONRPCRequestPayload, next: SubProvider.NextFunctionCallback, end: SubProvider.EndFunctionCallback): void {
        switch (payload.method) {
            case "eth_sendTransaction": {
                this._sendTransaction(payload, next, end);
                break;
            }

            default: {
                next();
                break;
            }
        }
    }

    public txPollMs = 5000;

    private _sendTransaction(payload: JSONRPCRequestPayload, next: SubProvider.NextFunctionCallback, end: SubProvider.EndFunctionCallback): void {
        console.log(`[migrations-saver]: ${payload.method}:
        -- ${JSON.stringify(payload, undefined, "\t")}
        `);


        // tslint:disable-next-line:no-this-assignment
        const self = this;

        const params = payload.params[0];
        // form record hashsum for transaction
        const txHashsum = TransactionLogger.makeTxHashsum(params.from, params.to, params.data);
        console.log(`#### send transaction ${txHashsum} ${payload.id} ${params.data}`)

        console.log(`${JSON.stringify(self.txLogger.logs)}`)
        // look for record in the log
        if (self.txLogger.checkLogExists(txHashsum)) {
            // if record were found - check for status
            const foundLogRecord = self.txLogger.getLog(txHashsum);
            // if status == pending
            if (foundLogRecord.status === "pending") {
                console.log(`##### got on pending`)
                // get tx receipt and look at blockNumber if it was mined
                return fulfillPendingTx(foundLogRecord, next, end);
            }
            else if (foundLogRecord.status === "fulfilled") {
                // tslint:disable-next-line:no-null-keyword
                console.log(`###### fulfilled`)
                // tslint:disable-next-line:no-null-keyword
                return end(null, foundLogRecord.txhash);
            }
            else {
                return end(new Error(`[MigrationSaver:handleRequest]: Unsupported log status "${foundLogRecord.status}" in tx ${foundLogRecord.txhash}`), null);
            }
        }
        // if no record were found - move next
        else {
            console.log(`###### new tx`)
            next(handleNewRequest);
        }

        function fulfillPendingTx(record: LogRecord, next: NextFunctionCallback, end: EndFunctionCallback): void {
            self.web3.eth.getTransaction(record.txhash, (err: Error, transaction: Web3.Transaction) => {
                if (err) {
                    // tslint:disable-next-line:no-null-keyword
                    return end(err, null);
                }

                if (!transaction) { // only for testrpc
                    console.log(`#### rpc log`)
                    return waitForNodeResponse(record.txhash, self.txPollMs, resolveAsTxComplete(record.txhash, (err, result) => end(err, result)));
                    // TODO: set a timer for sometime to wait until transaction will be with "status == rejected" or "successfull"
                    // return end(new Error(`Cannot retrieve transaction info for ${record.txhash}`), undefined);
                }
                // if it was mined - break, save record as fulfilled, return mined transaction hash
                else if (transaction.blockNumber !== null) {
                    // check transaction status
                    self.web3.eth.getTransactionReceipt(record.txhash, (err: Error, receipt: Web3.TransactionReceipt) => {
                        if (err) {
                            // tslint:disable-next-line:no-null-keyword
                            return end(err, null);
                        }
                        // and transaction finished successfully
                        // TODO: fix receipt.status field
                        const txStatus = (receipt as any).status;
                        console.log(`#### success log ${payload.id} ${txStatus}`)
                        if (txStatus !== undefined && parseInt(txStatus) === 1) {
                            self.txLogger.updateLog(record.txhash, "fulfilled");
                            // tslint:disable-next-line:no-null-keyword
                            return end(null, record.txhash);
                        }
                        //
                        else {
                            console.log(`#### remove log`)
                            self.txLogger.removeLog(record.txhash);
                            return next(handleNewRequest);
                        }
                    });
                }
                else {
                    // set a timer for sometime to wait until transaction will be with "status == rejected" or "successfull"
                    return waitForNodeResponse(record.txhash, self.txPollMs, resolveAsTxComplete(record.txhash, (err, result) => end(err, result)));
                }
            });
        }

        function handleNewRequest(err: Error|null, result: any|null, cb: () => void): void {
            if (!result) {
                if (isPendingError(err)) {
                    console.warn(`[MigrationSaver]: Pending tx found but it has no record in migration log [${payload.id}, ${JSON.stringify(payload.params, undefined, "\t")}`);
                }
                return cb();
            }

            const txhash: string = result;

            // receive tx hash and save record to the log as pending
            self.web3.eth.getTransaction(txhash, (err: Error, transaction: Web3.Transaction) => {
                self.txLogger.appendLog(params.from, params.to, params.data, txhash, "pending", transaction);

                // set a timer for sometime to wait until transaction will be with "status == rejected" or "successfull"
                // after tx is mined save record as fulfilled
                // return tx hash with end
                waitForNodeResponse(txhash, self.txPollMs, resolveAsTxComplete(txhash, cb));
            });
        }

        function resolveAsTxComplete(txhash: string, callback: (err: Error|null, result: any) => void): WaitTxCallback {
            return (err, receipt, status): void => {
                if (!receipt && !status) {
                    self.txLogger.removeLog(txhash);
                    // tslint:disable-next-line:no-null-keyword
                    return callback(err, null);
                }
                else if (receipt && status) {
                    if (status === 1) {
                        self.txLogger.updateLog(txhash, "fulfilled");
                        // tslint:disable-next-line:no-null-keyword
                        return callback(null, txhash);
                    }
                    else if (status === 0) {
                        self.txLogger.removeLog(txhash);
                        // tslint:disable-next-line:no-null-keyword
                        return callback(new Error(`[MigrationSaver:resolveAsTxComplete]: Transaction ${txhash} failed with status 0x0: ${err}. Receipt: ${JSON.stringify(receipt, undefined, "\t")}`), null);
                    }
                }
                else {
                    // tslint:disable-next-line:no-null-keyword
                    return callback(new Error(`[MigrationSaver:resolveAsTxComplete]: Undefined error occured ${err}`), null);
                }
            };
        }

        function waitForNodeResponse(txhash: string, timeoutMs: number, callback: WaitTxCallback): void {
            const timer = setInterval(() => {
                self.web3.eth.getTransactionReceipt(txhash, (err: Error, receipt: Web3.TransactionReceipt) => {
                    if (err) {
                        clearInterval(timer);
                        // tslint:disable-next-line:no-null-keyword
                        return callback(err, null, null);
                    }

                    if (!receipt) {
                        return;
                    }
                    const txStatus = (receipt as any).status;
                    if (txStatus !== undefined) {
                        clearInterval(timer);
                        return callback(err, receipt, parseInt(txStatus));
                    }

                    console.log(`inside interface: cannot define status ${JSON.stringify(receipt, undefined, "\t")}`);
                });
            }, timeoutMs, "waitForNodeResponce");
        }
    }
}
