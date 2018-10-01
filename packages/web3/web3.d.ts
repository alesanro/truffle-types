import Web3 from 'web3'
import { BigNumber } from 'bignumber.js';

declare module 'web3' {

    export interface TxDataPayable extends TxData {
        value?: BigNumber;
    }
    
    export type ContractEventArg = string | BigNumber | number | boolean;

    export interface DecodedLogArgs {
        [argName: string]: ContractEventArg;
    }

    export interface LogWithDecodedArgs<ArgsType extends DecodedLogArgs> extends DecodedLogEntry<ArgsType> {}
    export type RawLog = LogEntry;

    export type BlockParamLiteral = 'earliest' | 'latest' | 'pending'

    export interface EventFilterResult<A> {
        get(callback: (err: Error, logs: Array<FilterEvent<A>>) => void): void;
        watch(callback: (err: Error, result: FilterEvent<A>) => void): void;
        stopWatching(callback: () => void): void;
    }

    export interface EventFilterObject {
        fromBlock?: number|BlockParamLiteral;
        toBlock?: number|BlockParamLiteral;
        address?: string;
        topics?: LogTopic[];
      }
  
    export interface DecodedLogEntry<A> extends LogEntry {
        event: string;
        args: A;
    }
    
    export interface DecodedLogEntryEvent<A> extends DecodedLogEntry<A> {
        removed: boolean;
    }
    
    export interface LogEntryEvent extends LogEntry {
        removed: boolean;
    }
}