import { PathLike } from "fs";
import SubProvider from "web3-provider-engine/subproviders/subprovider";
// tslint:disable-next-line:no-implicit-dependencies
import { JSONRPCRequestPayload } from "ethereum-protocol";
import * as Web3 from "web3";

const TRANSACTION_ALREADY_PENDING = "Transaction with the same hash was already imported.";

function isPendingError(err: Error | undefined): boolean {
    return !!err && err.message === TRANSACTION_ALREADY_PENDING;
}

export class MigrationsSaverSubprovider extends SubProvider {
    constructor(readonly deployedAddressesPath: PathLike, public web3: Web3) {
        super();
    }

    public handleRequest(payload: JSONRPCRequestPayload, next: SubProvider.NextFunctionCallback, end: SubProvider.EndFunctionCallback): void {
        switch (payload.method) {
            case "eth_sendTransaction": {
                console.log(`[migrations-saver]: ${payload.method}:
                -- ${JSON.stringify(payload, undefined, "\t")}
                `);
                next((err: Error | undefined, result: any | undefined, cb) => {
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

                    const txHash = <string>result;
                    this.web3.eth.getTransaction(txHash, (err: Error, receipt: any) => {
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
