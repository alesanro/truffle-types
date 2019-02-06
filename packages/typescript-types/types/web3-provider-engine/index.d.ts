declare module "web3-provider-engine/subproviders/subprovider" {
    import Web3ProviderEngine from "web3-provider-engine";
    import { JSONRPCRequestPayload } from "web3";

    export type NextFunctionCallback = (
        handler?: (error: Error | null, result: any | null, cb: () => void) => void,
    ) => void;
    export type EndFunctionCallback = (error: Error | null, result: any | null) => void;

    export class SubProvider {
        constructor();

        setEngine(engine: Web3ProviderEngine): void;
        handleRequest(payload: JSONRPCRequestPayload, next: NextFunctionCallback, end: EndFunctionCallback): void;
    }
}
