declare type NextFunctionCallback = (
    handler?: (error: Error | null, result: any | null, cb: () => void) => void,
) => void;
declare type EndFunctionCallback = (error: Error | null, result: any | null) => void;

declare module "web3-provider-engine/subproviders/subprovider" {
    import Web3ProviderEngine from "web3-provider-engine";
    import { JSONRPCRequestPayload } from "web3";

    class SubProvider {
        constructor();

        setEngine(engine: Web3ProviderEngine): void;
        handleRequest(payload: JSONRPCRequestPayload, next: NextFunctionCallback, end: EndFunctionCallback): void;
    }

    export = SubProvider;
}
