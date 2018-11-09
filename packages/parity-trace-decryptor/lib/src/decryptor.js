"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TraceDecryptor {
    constructor(storage) {
        this.storage = storage;
    }
    decrypt(traceOutput, deployedAddresses = []) {
        const transformedAddresses = transformDeployedContracts(deployedAddresses);
        const decryptedOutput = [];
        for (const traceItem of traceOutput) {
            const decrytedFrom = transformedAddresses[traceItem.action.from];
            const decrytedTo = transformedAddresses[traceItem.action.to];
            const selector = this.storage.findBySig(getSigFromMessage(traceItem.action.input));
            decryptedOutput.push(Object.assign({}, traceItem, { decryptedAction: {
                    fromContract: decrytedFrom ? (decrytedFrom.name ? decrytedFrom.name : decrytedFrom.contract) : traceItem.action.from,
                    toContract: decrytedTo ? (decrytedTo.name ? decrytedTo.name : decrytedTo.contract) : traceItem.action.to,
                    selector: selector ? selector.selector : getSigFromMessage(traceItem.action.input),
                    contracts: selector ? selector.contracts : [],
                    gas: parseInt(traceItem.action.gas, 16),
                    gasUsed: traceItem.result ? parseInt(traceItem.result.gasUsed) : undefined,
                } }));
        }
        return decryptedOutput;
    }
    static buildTrace(traceOutput) {
        const traceItem = traceOutput[0];
        if (traceItem.traceAddress.length !== 0) { // means 'root'
            throw new Error("Invalid trace output format");
        }
        const treeTrace = Object.assign({}, traceItem, { calls: this._buildCallTrace(traceOutput.slice(1), traceItem.subtraces) });
        return [treeTrace];
    }
    static _buildCallTrace(traceOutput, subtraces) {
        const callTraceStack = [];
        for (let traceIdx = 0, subtraceCounter = 0; subtraceCounter < subtraces; ++traceIdx, ++subtraceCounter) {
            const traceItem = traceOutput[traceIdx];
            const treeTrace = Object.assign({}, traceItem, { calls: this._buildCallTrace(traceOutput.slice(traceIdx + 1), traceItem.subtraces) });
            traceIdx += this._countTrace(treeTrace.calls);
            callTraceStack.push(treeTrace);
        }
        return callTraceStack;
    }
    static _countTrace(treeTrace) {
        let count = 0;
        for (const traceNode of treeTrace) {
            count += this._countTrace(traceNode.calls);
        }
        return treeTrace.length + count;
    }
}
exports.TraceDecryptor = TraceDecryptor;
/**
 * Gets signature of internal message
 * @param input tx input
 * @returns signature's 4 bytes
 */
function getSigFromMessage(input) {
    return input.slice(0, 10);
}
function transformDeployedContracts(deployedAddresses) {
    return deployedAddresses.reduce((state, deployedContract) => {
        state[deployedContract.address] = deployedContract;
        return state;
    }, {});
}
