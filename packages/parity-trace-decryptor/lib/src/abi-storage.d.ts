/// <reference types="@machinomy/types-web3" />
import { AbiDefinition } from "web3";
import { ContractLedger, ContractInterface, ContractSignatures } from "./types";
export declare class AbiStorage {
    contracts: ContractInterface[];
    abis: {
        [contract: string]: ContractLedger;
    };
    globalSignatures: ContractSignatures;
    constructor(contracts: ContractInterface[]);
    addContract(contract: ContractInterface): void;
    findBySig(sig: string): {
        sig: string;
        selector: string;
        contracts: string[];
    } | undefined;
}
export declare function composeSignatures(abiDefinition: AbiDefinition): {
    sig: string;
    fullSig: string;
    selector: string;
};
export declare function composeSelector(abiDefinition: AbiDefinition): string;
