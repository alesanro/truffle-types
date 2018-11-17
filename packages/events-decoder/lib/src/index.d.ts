/// <reference types="types-web3" />
import AbiDecoder from "abi-decoder";
import { TransactionReceipt, LogWithDecodedArgs, DecodedLogArgs, ContractInstance } from "web3";
declare type EventFilterFunction = (logEntry: AbiDecoder.DecodedEvent) => boolean;
/**
 * Finds events with provided event name
 * @param contracts list of contracts that could have generated events
 * @param txReceipt transaction receipt with logs
 * @param eventName name of event that is needed to find
 */
export declare function findEvent<ArgsType extends DecodedLogArgs>(contracts: ContractInstance[], txReceipt: TransactionReceipt, eventName: string): LogWithDecodedArgs<ArgsType>[];
/**
 * Look up for events and return only that will pass filter function
 * @param contracts list of contracts that could have generated events
 * @param txReceipt transaction receipt with logs
 * @param filterFunc function to filter logs
 */
export declare function findEvents(contracts: ContractInstance[], txReceipt: TransactionReceipt, filterFunc: EventFilterFunction): LogWithDecodedArgs<any>[];
export {};
