// tslint:disable-next-line:no-implicit-dependencies
import { AbiDefinition } from "web3";
import { keccak256 } from "web3-utils";
import { ContractLedger, ContractInterface, ContractSignatures } from "./types";

export class AbiStorage {

    public abis: { [contract: string]: ContractLedger } = {};
    public globalSignatures: ContractSignatures = {};

    constructor(public contracts: ContractInterface[]) {
        for (const contract of contracts) {
            this.addContract(contract);
        }
    }

    public addContract(contract: ContractInterface) {
        const listOfSignatures = contract.abi.map(composeSignatures);

        const signatures =  listOfSignatures.reduce((previous, current, idx) => {
                previous[current.sig] = { selector: current.selector, };

                if (contract.abi[idx].type === "event") {
                    previous[current.sig].fullSignature = current.fullSig;
                }

                return previous;
            }, <ContractSignatures>{});

        this.abis[contract.contractName] = {
            name: contract.contractName,
            signatures,
        };

        // --

        for (const signature of listOfSignatures) {
            const record = this.globalSignatures[signature.sig] || { selector: signature.selector, contracts: [] };
            const associatedContracts = record.contracts || [];
            associatedContracts.push(contract.contractName);
            this.globalSignatures[signature.sig] = {
                ...record,
                contracts: associatedContracts,
            };
        }
    }

    public findBySig(sig: string): { sig: string, selector: string, contracts: string[], } |undefined {
        if (this.globalSignatures[sig]) {
            return {
                sig,
                selector: this.globalSignatures[sig].selector,
                contracts: this.globalSignatures[sig].contracts || [],
            };
        }
    }
}

export function composeSignatures(abiDefinition: AbiDefinition): { sig: string, fullSig: string, selector: string } {
    const selector = composeSelector(abiDefinition);
    const fullSig = keccak256(selector);
    const sig = fullSig.slice(0, 10);
    return { sig, fullSig, selector };
}

export function composeSelector(abiDefinition: AbiDefinition): string {
    if (abiDefinition.type === "function") {
        return `${abiDefinition.name}(${abiDefinition.inputs.map(v => v.type).join(",")})`;
    }
    else if (abiDefinition.type === "fallback") {
        return "()";
    }
    else if (abiDefinition.type === "constructor") {
        return `constructor(${abiDefinition.inputs.map(v => v.type).join(",")})`;
    }
    else if (abiDefinition.type === "event") {
        return `${abiDefinition.name}(${abiDefinition.inputs.map(v => v.type).join(",")})`;
    }

    throw new Error(`Undeclared ABI type found '${JSON.stringify(abiDefinition, undefined, "\t")}'`);
}
