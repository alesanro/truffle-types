declare type NextFunctionCallback = (
    handler?: (error: Error | null, result: any | null, cb: () => void) => void
) => void;
declare type EndFunctionCallback = (
    error: Error | null,
    result: any | null
) => void;

declare module "web3-provider-engine/subproviders/subprovider" {
    import Web3ProviderEngine from "web3-provider-engine";

    interface JsonRPCRequest {
        jsonrpc: string;
        method: string;
        params: any[];
        id: number;
    }

    class SubProvider {
        constructor();

        setEngine(engine: Web3ProviderEngine): void;
        handleRequest(
            payload: JsonRPCRequest,
            next: NextFunctionCallback,
            end: EndFunctionCallback
        ): void;
    }

    export = SubProvider;
}
