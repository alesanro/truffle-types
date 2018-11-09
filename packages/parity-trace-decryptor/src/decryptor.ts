import { AbiStorage } from "./abi-storage";
import { TraceOutput, DeployedContractTyple, DecryptedTraceOutput, TreeTrace, Trace } from "./types";

interface DeployedAddressesDictionary {
    [address: string]: DeployedContractTyple;
}

export class TraceDecryptor {
    constructor(public storage: AbiStorage) {}

    public decrypt(traceOutput: TraceOutput, deployedAddresses: DeployedContractTyple[] = []): DecryptedTraceOutput {
        const transformedAddresses = transformDeployedContracts(deployedAddresses);
        const decryptedOutput = <DecryptedTraceOutput>[];

        for (const traceItem of traceOutput) {
            const decrytedFrom = transformedAddresses[traceItem.action.from];
            const decrytedTo = transformedAddresses[traceItem.action.to];
            const selector = this.storage.findBySig(getSigFromMessage(traceItem.action.input));

            decryptedOutput.push({
                ...traceItem,
                decryptedAction: {
                    fromContract: decrytedFrom ? (decrytedFrom.name ? decrytedFrom.name : decrytedFrom.contract) : traceItem.action.from,
                    toContract: decrytedTo ? (decrytedTo.name ? decrytedTo.name : decrytedTo.contract) : traceItem.action.to,
                    selector: selector ? selector.selector : getSigFromMessage(traceItem.action.input),
                    contracts: selector ? selector.contracts : [],
                    gas: parseInt(traceItem.action.gas, 16),
                    gasUsed: traceItem.result ? parseInt(traceItem.result.gasUsed) : undefined,
                }
            });
        }

        return decryptedOutput;
    }

    public static buildTrace(traceOutput: TraceOutput): TreeTrace<Trace>[] {
        const traceItem = traceOutput[0];
        if (traceItem.traceAddress.length !== 0) { // means 'root'
            throw new Error("Invalid trace output format");
        }

        const treeTrace = {
            ...traceItem,
            calls: this._buildCallTrace(traceOutput.slice(1), traceItem.subtraces),
        };

        return [treeTrace];
    }

    private static _buildCallTrace(traceOutput: TraceOutput, subtraces: number): TreeTrace<Trace>[] {
        const callTraceStack = [] as TreeTrace<Trace>[];
        for (let traceIdx = 0, subtraceCounter = 0; subtraceCounter < subtraces; ++traceIdx, ++subtraceCounter) {
            const traceItem = traceOutput[traceIdx];
            const treeTrace = {
                ...traceItem,
                calls: this._buildCallTrace(traceOutput.slice(traceIdx + 1), traceItem.subtraces)
            };
            traceIdx += this._countTrace(treeTrace.calls);
            callTraceStack.push(treeTrace);
        }

        return callTraceStack;
    }

    private static _countTrace<T>(treeTrace: TreeTrace<any>[]): number {
        let count = 0;
        for (const traceNode of treeTrace) {
            count += this._countTrace(traceNode.calls);
        }

        return treeTrace.length + count;
    }
}


/**
 * Gets signature of internal message
 * @param input tx input
 * @returns signature's 4 bytes
 */
function getSigFromMessage(input: string): string {
    return input.slice(0, 10);
}

function transformDeployedContracts(deployedAddresses: DeployedContractTyple[]): DeployedAddressesDictionary {
    return deployedAddresses.reduce((state, deployedContract) => {
        state[deployedContract.address] = deployedContract;
        return state;
    }, <DeployedAddressesDictionary>{});
}