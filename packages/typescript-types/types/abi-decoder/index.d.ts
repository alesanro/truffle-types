
declare module "abi-decoder" {
    
    import { BigNumber } from "bignumber.js";
    import { ContractAbi, FunctionParameter, LogEntry } from "web3"

    namespace AbiDecoder {

        interface Method {
            name: string;
            params: FunctionParameter[]
        }
        
        interface DecodedEventArg {
            name: string;
            type: string;
            value: string | BigNumber
        }

        interface DecodedEvent {
            name: string;
            address: string;
            events: DecodedEventArg[];
            rawLogIndex: number;
        }

        function getABIs(): ContractAbi
        function addABI(abis: ContractAbi): void
        function getMethodIDs(): string[]
        function decodeMethod(sig: string): Method | undefined
        function decodeLogs(logs: LogEntry[]): DecodedEvent[]
        function removeABI(abis: ContractAbi): void
    }

    export = AbiDecoder
}