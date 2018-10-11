import AbiDecoder from "abi-decoder";
import { TransactionReceipt, LogEntry, LogWithDecodedArgs, DecodedLogArgs, ContractInstance } from "web3";
import * as _ from "lodash";

type EventFilterFunction = (logEntry: AbiDecoder.DecodedEvent) => boolean;

/**
 * Finds events with provided event name
 * @param contracts list of contracts that could have generated events
 * @param txReceipt transaction receipt with logs
 * @param eventName name of event that is needed to find
 */
export function findEvent<ArgsType extends DecodedLogArgs>(contracts: ContractInstance[], txReceipt: TransactionReceipt, eventName: string): LogWithDecodedArgs<ArgsType>[] {
    return <LogWithDecodedArgs<ArgsType>[]>(findEvents(contracts, txReceipt, logEntry => logEntry.name === eventName));
}

/**
 * Look up for events and return only that will pass filter function
 * @param contracts list of contracts that could have generated events
 * @param txReceipt transaction receipt with logs
 * @param filterFunc function to filter logs
 */
export function findEvents(contracts: ContractInstance[], txReceipt: TransactionReceipt, filterFunc: EventFilterFunction): LogWithDecodedArgs<any>[] {
    _.forEach(contracts, c => AbiDecoder.addABI(c.abi));

    const logs = AbiDecoder.decodeLogs(txReceipt.logs);
    const events = _.filter(logs, l => l !== undefined)
        .filter(l => l !== null)
        .filter(filterFunc)
        .map(l => __updateEventWithArgs(l, txReceipt.logs[l.rawLogIndex]));

    _.forEach(contracts, c => AbiDecoder.removeABI(c.abi));

    return events;
}

function __updateEventWithArgs(decodedEvent: AbiDecoder.DecodedEvent, encodedLog: LogEntry): LogWithDecodedArgs<any> {
    const logEvent = <LogWithDecodedArgs<any>>{
        ...encodedLog,
        event: decodedEvent.name,
        args: {},
    };

    _.forEach(decodedEvent.events, arg => {
        logEvent.args[arg.name] = arg.value;
    });

    return logEvent;
}
