"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subprovider_1 = __importDefault(require("web3-provider-engine/subproviders/subprovider"));
const tx_logger_1 = require("./tx-logger");
const timers_1 = require("timers");
const TRANSACTION_ALREADY_PENDING = "Transaction with the same hash was already imported.";
function isPendingError(err) {
    return !!err && err.message === TRANSACTION_ALREADY_PENDING;
}
class MigrationsSaverSubprovider extends subprovider_1.default {
    constructor(deployedAddressesPath, web3, txLogger) {
        super();
        this.deployedAddressesPath = deployedAddressesPath;
        this.web3 = web3;
        this.txLogger = txLogger;
        this.txPollMs = 5000;
    }
    handleRequest(payload, next, end) {
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
    _sendTransaction(payload, next, end) {
        console.log(`[migrations-saver]: ${payload.method}:
        -- ${JSON.stringify(payload, undefined, "\t")}
        `);
        // tslint:disable-next-line:no-this-assignment
        const self = this;
        const params = payload.params[0];
        // form record hashsum for transaction
        const txHashsum = tx_logger_1.TransactionLogger.makeTxHashsum(params.from, params.to, params.data);
        console.log(`#### send transaction ${txHashsum} ${payload.id} ${params.data}`);
        console.log(`${JSON.stringify(self.txLogger.logs)}`);
        // look for record in the log
        if (self.txLogger.checkLogExists(txHashsum)) {
            // if record were found - check for status
            const foundLogRecord = self.txLogger.getLog(txHashsum);
            // if status == pending
            if (foundLogRecord.status === "pending") {
                console.log(`##### got on pending`);
                // get tx receipt and look at blockNumber if it was mined
                return fulfillPendingTx(foundLogRecord, next, end);
            }
            else if (foundLogRecord.status === "fulfilled") {
                // tslint:disable-next-line:no-null-keyword
                console.log(`###### fulfilled`);
                // tslint:disable-next-line:no-null-keyword
                return end(null, foundLogRecord.txhash);
            }
            else {
                return end(new Error(`[MigrationSaver:handleRequest]: Unsupported log status "${foundLogRecord.status}" in tx ${foundLogRecord.txhash}`), null);
            }
        }
        // if no record were found - move next
        else {
            console.log(`###### new tx`);
            next(handleNewRequest);
        }
        function fulfillPendingTx(record, next, end) {
            self.web3.eth.getTransaction(record.txhash, (err, transaction) => {
                if (err) {
                    // tslint:disable-next-line:no-null-keyword
                    return end(err, null);
                }
                if (!transaction) { // only for testrpc
                    console.log(`#### rpc log`);
                    return waitForNodeResponse(record.txhash, self.txPollMs, resolveAsTxComplete(record.txhash, (err, result) => end(err, result)));
                    // TODO: set a timer for sometime to wait until transaction will be with "status == rejected" or "successfull"
                    // return end(new Error(`Cannot retrieve transaction info for ${record.txhash}`), undefined);
                }
                // if it was mined - break, save record as fulfilled, return mined transaction hash
                else if (transaction.blockNumber !== null) {
                    // check transaction status
                    self.web3.eth.getTransactionReceipt(record.txhash, (err, receipt) => {
                        if (err) {
                            // tslint:disable-next-line:no-null-keyword
                            return end(err, null);
                        }
                        // and transaction finished successfully
                        // TODO: fix receipt.status field
                        const txStatus = receipt.status;
                        console.log(`#### success log ${payload.id} ${txStatus}`);
                        if (txStatus !== undefined && parseInt(txStatus) === 1) {
                            self.txLogger.updateLog(record.txhash, "fulfilled");
                            // tslint:disable-next-line:no-null-keyword
                            return end(null, record.txhash);
                        }
                        //
                        else {
                            console.log(`#### remove log`);
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
        function handleNewRequest(err, result, cb) {
            if (!result) {
                if (isPendingError(err)) {
                    console.warn(`[MigrationSaver]: Pending tx found but it has no record in migration log [${payload.id}, ${JSON.stringify(payload.params, undefined, "\t")}`);
                }
                return cb();
            }
            const txhash = result;
            // receive tx hash and save record to the log as pending
            self.web3.eth.getTransaction(txhash, (err, transaction) => {
                self.txLogger.appendLog(params.from, params.to, params.data, txhash, "pending", transaction);
                // set a timer for sometime to wait until transaction will be with "status == rejected" or "successfull"
                // after tx is mined save record as fulfilled
                // return tx hash with end
                waitForNodeResponse(txhash, self.txPollMs, resolveAsTxComplete(txhash, cb));
            });
        }
        function resolveAsTxComplete(txhash, callback) {
            return (err, receipt, status) => {
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
        function waitForNodeResponse(txhash, timeoutMs, callback) {
            const timer = timers_1.setInterval(() => {
                self.web3.eth.getTransactionReceipt(txhash, (err, receipt) => {
                    if (err) {
                        timers_1.clearInterval(timer);
                        // tslint:disable-next-line:no-null-keyword
                        return callback(err, null, null);
                    }
                    if (!receipt) {
                        return;
                    }
                    const txStatus = receipt.status;
                    if (txStatus !== undefined) {
                        timers_1.clearInterval(timer);
                        return callback(err, receipt, parseInt(txStatus));
                    }
                    console.log(`inside interface: cannot define status ${JSON.stringify(receipt, undefined, "\t")}`);
                });
            }, timeoutMs, "waitForNodeResponce");
        }
    }
}
exports.MigrationsSaverSubprovider = MigrationsSaverSubprovider;
