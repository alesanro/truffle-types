"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_utils_1 = require("web3-utils");
class AbiStorage {
    constructor(contracts) {
        this.contracts = contracts;
        this.abis = {};
        this.globalSignatures = {};
        for (const contract of contracts) {
            this.addContract(contract);
        }
    }
    addContract(contract) {
        const listOfSignatures = contract.abi.map(composeSignatures);
        const signatures = listOfSignatures.reduce((previous, current, idx) => {
            previous[current.sig] = { selector: current.selector, };
            if (contract.abi[idx].type === "event") {
                previous[current.sig].fullSignature = current.fullSig;
            }
            return previous;
        }, {});
        this.abis[contract.contractName] = {
            name: contract.contractName,
            signatures,
        };
        // --
        for (const signature of listOfSignatures) {
            const record = this.globalSignatures[signature.sig] || { selector: signature.selector, contracts: [] };
            const associatedContracts = record.contracts || [];
            associatedContracts.push(contract.contractName);
            this.globalSignatures[signature.sig] = Object.assign({}, record, { contracts: associatedContracts });
        }
    }
    findBySig(sig) {
        if (this.globalSignatures[sig]) {
            return {
                sig,
                selector: this.globalSignatures[sig].selector,
                contracts: this.globalSignatures[sig].contracts || [],
            };
        }
    }
}
exports.AbiStorage = AbiStorage;
function composeSignatures(abiDefinition) {
    const selector = composeSelector(abiDefinition);
    const fullSig = web3_utils_1.keccak256(selector);
    const sig = fullSig.slice(0, 10);
    return { sig, fullSig, selector };
}
exports.composeSignatures = composeSignatures;
function composeSelector(abiDefinition) {
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
exports.composeSelector = composeSelector;
