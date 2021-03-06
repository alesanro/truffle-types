import SubProvider from "web3-provider-engine/subproviders/subprovider";
import Web3, {
    JSONRPCRequestPayload,
    TransactionReceipt,
    Transaction
    // tslint:disable-next-line:no-implicit-dependencies
} from "web3";
// tslint:disable-next-line:no-implicit-dependencies
import { padRight } from "web3-utils";
import { TransactionLogger } from "../tx-logger";
import { setInterval, clearInterval } from "timers";
import { LogRecord } from "../types";

const TRANSACTION_ALREADY_PENDING =
    "Transaction with the same hash was already imported.";
const ZERO_ADDRESS = padRight("0x", 40, "0");
const CONTRACT_CREATION_PREFIX = "0x60806040";

const SUBPROVIDER_LOG_PREFIX = "[TransactionSaver subprovider]";

type WaitTxCallback = (
    err: Error | null,
    receipt: TransactionReceipt | null,
    status: number | null
) => void;

function isPendingError(err: Error | null): boolean {
    return !!err && err.message === TRANSACTION_ALREADY_PENDING;
}

interface Options {
    skipMultipleContractDeploys: boolean;
}

export class TransactionSaverSubprovider extends SubProvider {
    readonly options: Options;

    constructor(
        public web3: Web3,
        public txLogger: TransactionLogger,
        options: Options = { skipMultipleContractDeploys: false }
    ) {
        super();

        this.options = options;
    }

    public handleRequest(
        payload: JSONRPCRequestPayload,
        next: NextFunctionCallback,
        end: EndFunctionCallback
    ): void {
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

    private _sendTransaction(
        payload: JSONRPCRequestPayload,
        next: NextFunctionCallback,
        end: EndFunctionCallback
    ): void {
        // tslint:disable-next-line:no-this-assignment
        const self = this;

        const params = payload.params[0];
        // form record hashsum for transaction
        const txHashsum = TransactionLogger.makeTxHashsum(
            params.from,
            params.to,
            params.data
        );
        console.group(`${SUBPROVIDER_LOG_PREFIX} send transaction...`);
        console.groupCollapsed(`tx info:`);
        console.log(`
        - hashsum ${txHashsum}
        - payload id ${payload.id}
        - input ${params.data}
        `);
        console.groupEnd();

        if (
            this._isContractCreation(params.to, params.data) &&
            !this.options.skipMultipleContractDeploys
        ) {
            console.groupEnd();
            return next(handleNewRequest);
        }

        // look for record in the log
        if (self.txLogger.checkLogExists(txHashsum)) {
            // if record were found - check for status
            const foundLogRecord = self.txLogger.getLog(txHashsum);
            // if status == pending
            if (foundLogRecord.status === "pending") {
                console.log(
                    `found tx ${
                        foundLogRecord.txhash
                    } in file: try to find in pendings`
                );
                // get tx receipt and look at blockNumber if it was mined
                return fulfillPendingTx(foundLogRecord, next, end);
            } else if (foundLogRecord.status === "fulfilled") {
                console.log(
                    `found tx ${
                        foundLogRecord.txhash
                    } in file: fulfilled before any transaction`
                );
                console.groupEnd();

                // tslint:disable-next-line:no-null-keyword
                return end(null, foundLogRecord.txhash);
            } else {
                console.groupEnd();
                return end(
                    new Error(
                        `[MigrationSaver:handleRequest]: Unsupported log status "${
                            foundLogRecord.status
                        }" in tx ${foundLogRecord.txhash}`
                    ),
                    // tslint:disable-next-line:no-null-keyword
                    null
                );
            }
        }
        // if no record were found - move next
        else {
            console.log(
                `no tx found for hashsum ${txHashsum} in logs: perform new tx`
            );
            next(handleNewRequest);
        }

        function fulfillPendingTx(
            record: LogRecord,
            next: NextFunctionCallback,
            end: EndFunctionCallback
        ): void {
            self.web3.eth.getTransaction(
                record.txhash,
                (err: Error, transaction: Transaction) => {
                    if (err) {
                        console.groupEnd();
                        // tslint:disable-next-line:no-null-keyword
                        return end(err, null);
                    }

                    if (!transaction) {
                        // only for testrpc
                        console.log(`...looking for pending: rpc log`);
                        return waitForNodeResponse(
                            record.txhash,
                            self.txPollMs,
                            resolveAsTxComplete(
                                record.txhash,
                                (err, result) => {
                                    console.groupEnd();
                                    end(err, result);
                                }
                            )
                        );
                        // TODO: set a timer for sometime to wait until transaction will be with "status == rejected" or "successfull"
                        // return end(new Error(`Cannot retrieve transaction info for ${record.txhash}`), undefined);
                    }
                    // if it was mined - break, save record as fulfilled, return mined transaction hash
                    else if (transaction.blockNumber !== null) {
                        // check transaction status
                        self.web3.eth.getTransactionReceipt(
                            record.txhash,
                            (err: Error, receipt: TransactionReceipt) => {
                                if (err) {
                                    // tslint:disable-next-line:no-null-keyword
                                    return end(err, null);
                                }
                                // and transaction finished successfully
                                // TODO: fix receipt.status field
                                const txStatus = (receipt as any).status;
                                console.log(
                                    `...looking for pending: success log ${
                                        payload.id
                                    } ${txStatus}`
                                );
                                if (
                                    txStatus !== undefined &&
                                    parseInt(txStatus) === 1
                                ) {
                                    self.txLogger.updateLog(
                                        record.txhash,
                                        "fulfilled"
                                    );
                                    // tslint:disable-next-line:no-null-keyword
                                    return end(null, record.txhash);
                                }
                                //
                                else {
                                    console.log(
                                        `...looking for pending: cannot get no tx, remove log`
                                    );
                                    self.txLogger.removeLog(record.txhash);
                                    return next(handleNewRequest);
                                }
                            }
                        );
                    } else {
                        // set a timer for sometime to wait until transaction will be with "status == rejected" or "successfull"
                        console.log(`...looking for pending: run timer`);
                        return waitForNodeResponse(
                            record.txhash,
                            self.txPollMs,
                            resolveAsTxComplete(
                                record.txhash,
                                (err, result) => {
                                    console.groupEnd();

                                    end(err, result);
                                }
                            )
                        );
                    }
                }
            );
        }

        function handleNewRequest(
            err: Error | null,
            result: any | null,
            cb: () => void
        ): void {
            if (!result) {
                if (isPendingError(err)) {
                    console.groupCollapsed(`[Migration saver]: warning`);
                    console.warn(
                        `[MigrationSaver]: Pending tx found but it has no record in migration log [${
                            payload.id
                        }, ${JSON.stringify(payload.params, undefined, "\t")}`
                    );
                    console.groupEnd();
                }
                return cb();
            }

            const txhash: string = result;

            // receive tx hash and save record to the log as pending
            self.web3.eth.getTransaction(
                txhash,
                (err: Error, transaction: Transaction) => {
                    console.groupCollapsed(
                        `new tx ${txhash} request: try to wait for mined tx...`
                    );
                    console.log(
                        `tx data: ${JSON.stringify(
                            transaction,
                            undefined,
                            "\t"
                        )}`
                    );
                    console.groupEnd();
                    self.txLogger.appendLog(
                        params.from,
                        params.to,
                        params.data,
                        txhash,
                        "pending",
                        transaction
                    );

                    // set a timer for sometime to wait until transaction will be with "status == rejected" or "successfull"
                    // after tx is mined save record as fulfilled
                    // return tx hash with end
                    waitForNodeResponse(
                        txhash,
                        self.txPollMs,
                        resolveAsTxComplete(txhash, cb)
                    );
                }
            );
        }

        function resolveAsTxComplete(
            txhash: string,
            callback: (err: Error | null, result: any) => void
        ): WaitTxCallback {
            return (err, receipt, status): void => {
                if (!receipt && !status) {
                    self.txLogger.removeLog(txhash);
                    console.groupEnd();

                    // tslint:disable-next-line:no-null-keyword
                    return callback(err, null);
                } else if (receipt && status) {
                    if (status === 1) {
                        console.log(
                            `resolve tx ${txhash} as: fulfilled, status == 0x1`
                        );
                        self.txLogger.updateLog(txhash, "fulfilled");
                        console.groupEnd();

                        // tslint:disable-next-line:no-null-keyword
                        return callback(null, txhash);
                    } else if (status === 0) {
                        console.log(
                            `resolve tx ${txhash} as: failed, status == 0x0`
                        );
                        self.txLogger.removeLog(txhash);
                        console.groupEnd();

                        return callback(
                            new Error(
                                `[MigrationSaver:resolveAsTxComplete]: Transaction ${txhash} failed with status 0x0: ${err}. Receipt: ${JSON.stringify(
                                    receipt,
                                    undefined,
                                    "\t"
                                )}`
                            ),
                            // tslint:disable-next-line:no-null-keyword
                            null
                        );
                    }
                } else {
                    console.groupEnd();

                    return callback(
                        new Error(
                            `[MigrationSaver:resolveAsTxComplete]: Undefined error occured ${err}`
                        ),
                        // tslint:disable-next-line:no-null-keyword
                        null
                    );
                }
            };
        }

        function waitForNodeResponse(
            txhash: string,
            timeoutMs: number,
            callback: WaitTxCallback
        ): void {
            const timer = setInterval(
                () => {
                    self.web3.eth.getTransactionReceipt(
                        txhash,
                        (err: Error, receipt: TransactionReceipt) => {
                            console.info(`...wait for tx: ${txhash}`);
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
                                return callback(
                                    err,
                                    receipt,
                                    parseInt(txStatus)
                                );
                            }
                        }
                    );
                },
                timeoutMs,
                "waitForNodeResponce"
            );
        }
    }

    private _isContractCreation(to: string, data: string): boolean {
        return (
            (to === undefined || to === ZERO_ADDRESS) &&
            (!!data &&
                data.length > 2 &&
                data.slice(0, 10) === CONTRACT_CREATION_PREFIX)
        );
    }
}
