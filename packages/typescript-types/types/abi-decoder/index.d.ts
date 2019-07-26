declare module "abi-decoder" {
    import { BigNumber } from "bignumber.js";
    import { ContractAbi, FunctionParameter } from "abi-primitives";
    import { LogEntry } from "web3-types";

    export interface Method {
        name: string;
        params: FunctionParameter[];
    }

    export interface DecodedEventArg {
        name: string;
        type: string;
        value: string | BigNumber;
    }

    export interface DecodedEvent {
        name: string;
        address: string;
        events: DecodedEventArg[];
        rawLogIndex: number;
    }

    export function getABIs(): ContractAbi;
    export function addABI(abis: ContractAbi): void;
    export function getMethodIDs(): string[];
    export function decodeMethod(sig: string): Method | undefined;
    export function decodeLogs(logs: LogEntry[]): DecodedEvent[];
    export function removeABI(abis: ContractAbi): void;
}
