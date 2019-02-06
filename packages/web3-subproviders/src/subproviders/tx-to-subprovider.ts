import { SubProvider, NextFunctionCallback, EndFunctionCallback } from "web3-provider-engine/subproviders/subprovider";
// tslint:disable-next-line:no-implicit-dependencies
import { JSONRPCRequestPayload } from "web3";
import { EventEmitter } from "events";
// tslint:disable-next-line:no-implicit-dependencies
import { padRight } from "web3-utils";

const ZERO_ADDRESS = padRight("0x", 40, "0");

export type TxDestinationEventCallback = (toAddress: string, sig: string, txhash: string) => void;

export enum TransactionDestinationEvents {
    TxDestination = "txTo",
}

export class TransactionDestinationSubprovider extends SubProvider {
    public emitter = new EventEmitter();

    public handleRequest(payload: JSONRPCRequestPayload, next: NextFunctionCallback, end: EndFunctionCallback): void {
        switch (payload.method) {
            case "eth_sendTransaction": {
                const params = payload.params[0];
                next((err: any | undefined, result: any | undefined, cb: () => void) => {
                    if (!err) {
                        this.emitter.emit(
                            TransactionDestinationEvents.TxDestination,
                            params.to || ZERO_ADDRESS,
                            params.data.length > 2 ? params.data.slice(0, 10) : "",
                            result,
                        );
                    }
                    cb();
                });
                break;
            }
            default: {
                next();
                break;
            }
        }
    }
}
