declare module "web3-provider-engine/subproviders/subprovider" {

    import Web3ProviderEngine from "web3-provider-engine";
    import { JSONRPCRequestPayload } from "ethereum-protocol";

    namespace SubProvider {
        type NextFunctionCallback = (handler?: (error: any | null, result: any | null, cb: () => void) => void) => void;
        type EndFunctionCallback = (error: any, result: any) => void;
    }

    class SubProvider {
        constructor();

        setEngine(engine: Web3ProviderEngine): void;
        handleRequest(payload: JSONRPCRequestPayload, next: SubProvider.NextFunctionCallback, end: SubProvider.EndFunctionCallback): void;
    }

    export = SubProvider;
}
