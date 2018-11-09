import { AbiStorage } from "./abi-storage";
import { TraceOutput, DeployedContractTyple, DecryptedTraceOutput, TreeTrace, Trace } from "./types";
export declare class TraceDecryptor {
    storage: AbiStorage;
    constructor(storage: AbiStorage);
    decrypt(traceOutput: TraceOutput, deployedAddresses?: DeployedContractTyple[]): DecryptedTraceOutput;
    static buildTrace(traceOutput: TraceOutput): TreeTrace<Trace>[];
    private static _buildCallTrace;
    private static _countTrace;
}
