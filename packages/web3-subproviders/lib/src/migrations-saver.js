"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subprovider_1 = __importDefault(require("web3-provider-engine/subproviders/subprovider"));
const TRANSACTION_ALREADY_PENDING = "Transaction with the same hash was already imported.";
function isPendingError(err) {
    return !!err && err.message === TRANSACTION_ALREADY_PENDING;
}
class MigrationsSaverSubprovider extends subprovider_1.default {
    constructor(deployedAddressesPath, web3) {
        super();
        this.deployedAddressesPath = deployedAddressesPath;
        this.web3 = web3;
    }
    handleRequest(payload, next, end) {
        switch (payload.method) {
            case "eth_sendTransaction": {
                console.log(`[migrations-saver]: ${payload.method}:
                -- ${JSON.stringify(payload, undefined, "\t")}
                `);
                next((err, result, cb) => {
                    if (isPendingError(err)) {
                        // wait until will be mined
                    }
                    if (err) {
                        console.log(`---- [error] ${payload.id} ${JSON.stringify(err, undefined, "\t")}`);
                        console.log(`---- [error] ${payload.id} "${err.name}" "${err.message}"`);
                        return cb();
                    }
                    console.log(JSON.stringify(`---- [migrations-saver][result]: ${payload.method} ${payload.id}:
                    ---- ${JSON.stringify(result || err, undefined, "\t")}
                    `));
                    const txHash = result;
                    this.web3.eth.getTransaction(txHash, (err, receipt) => {
                        if (err) {
                            return cb();
                        }
                        console.log(`------ blockNumber: ${JSON.stringify(receipt, undefined, "\t")}`);
                        // console.log(`------ blockNumber: ${receipt.blockNumber}`);
                        cb();
                    });
                });
                break;
            }
            // case "eth_sendRawTransaction": {
            //     console.log(`[migrations-saver]: ${payload.method}:
            //     -- ${JSON.stringify(payload, undefined, "\t")}
            //     `);
            //     next((err, result, cb) => {
            //         console.log(JSON.stringify(`---- [migrations-saver][result]: ${payload.method}:
            //         ---- ${JSON.stringify(result || err, undefined, "\t")}
            //         `));
            //         cb();
            //     });
            //     break;
            // }
            default: {
                next();
                break;
            }
        }
    }
}
exports.MigrationsSaverSubprovider = MigrationsSaverSubprovider;
