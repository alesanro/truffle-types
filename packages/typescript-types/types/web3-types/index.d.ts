declare module "web3-types" {
    interface CallTxDataBase {
        to?: string;
        value?: number | string;
        gas?: number | string;
        gasPrice?: number | string;
        data?: string;
        nonce?: number;
    }

    export interface CallData extends CallTxDataBase {
        from?: string;
    }

    export interface TxData extends CallTxDataBase {
        from: string;
    }

    export interface TxDataPayable extends TxData {
        value?: string;
    }

    export type BlockParamLiteral = "earliest" | "latest" | "pending";

    export interface DecodedLogArgs {
        [argName: string]: ContractEventArg;
    }

    export type ContractEventArg = string | number | boolean | string[];

    export interface EventFilterObject {
        fromBlock?: number | BlockParamLiteral;
        toBlock?: number | BlockParamLiteral;
        address?: string;
        topics?: LogTopic[];
    }

    export interface EventFilterResult<A> {
        get(callback: (err: Error, logs: FilterEvent<A>[]) => void): void;
        watch(callback: (err: Error, result: FilterEvent<A>) => void): void;
        stopWatching(callback: () => void): void;
    }

    type FilterEvent<A> = SolidityEvent<A> & LogEntry;

    interface SolidityEvent<A> {
        event: string;
        address: string;
        args: A;
    }

    interface LogEntry {
        logIndex: number | null;
        transactionIndex: number;
        transactionHash: string;
        blockHash: string | null;
        blockNumber: number | null;
        address: string;
        data: string;
        topics: string[];
    }

    type LogTopic = null | string | string[];
}
