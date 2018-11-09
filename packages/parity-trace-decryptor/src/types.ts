import { ContractAbi } from "web3";

export type CallType = "call" | "delegatecall";

export interface DeployedContractTyple {
    address: string;
    contract: string;
    name?: string;
}

export interface Action {
    callType: CallType;
    from: string;
    to: string;
    input: string;
    value: string;
    gas: string;
}

export interface DecryptedAction {
    fromContract: string;
    toContract: string;
    selector?: string;
    contracts?: string[];
    gas: number;
    gasUsed: number | undefined;
}

export interface Trace {
    action: Action;
    error?: string;
    result?: OperationResult;
    subtraces: number;
    traceAddress: number[];
    type: CallType;
}

export type TraceOutput = Trace[];

export interface OperationResult {
    gasUsed: string;
    output: string;
}

export interface DecryptedTrace extends Trace {
    decryptedAction: DecryptedAction;
}

export type DecryptedTraceOutput = DecryptedTrace[];

export interface TreeTrace<T extends Trace> extends Trace {
    calls: TreeTrace<T>[];
}

export interface DecryptedTreeTrace<T extends DecryptedTrace> extends TreeTrace<T>, DecryptedTrace {
    calls: DecryptedTreeTrace<T>[];
}

export interface ContractLedger {
    name: string;
    signatures: ContractSignatures;
}

export interface ContractSignatures {
    [sig: string]: ContractSignatureRecord;
}

export interface ContractSignatureRecord {
    selector: string;
    contracts?: string[];
    fullSignature?: string;
}

export interface ContractInterface {
    contractName: string;
    abi: ContractAbi;
}
