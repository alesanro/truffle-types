"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const abi_decoder_1 = __importDefault(require("abi-decoder"));
const _ = __importStar(require("lodash"));
/**
 * Finds events with provided event name
 * @param contracts list of contracts that could have generated events
 * @param txReceipt transaction receipt with logs
 * @param eventName name of event that is needed to find
 */
function findEvent(contracts, txReceipt, eventName) {
    return (findEvents(contracts, txReceipt, logEntry => logEntry.name === eventName));
}
exports.findEvent = findEvent;
/**
 * Look up for events and return only that will pass filter function
 * @param contracts list of contracts that could have generated events
 * @param txReceipt transaction receipt with logs
 * @param filterFunc function to filter logs
 */
function findEvents(contracts, txReceipt, filterFunc) {
    _.forEach(contracts, c => abi_decoder_1.default.addABI(c.abi));
    const logs = abi_decoder_1.default.decodeLogs(txReceipt.logs);
    const events = _.filter(logs, l => l !== undefined)
        .filter(l => l !== null)
        .filter(filterFunc)
        .map(l => __updateEventWithArgs(l, txReceipt.logs[l.rawLogIndex]));
    _.forEach(contracts, c => abi_decoder_1.default.removeABI(c.abi));
    return events;
}
exports.findEvents = findEvents;
function __updateEventWithArgs(decodedEvent, encodedLog) {
    const logEvent = Object.assign({}, encodedLog, { event: decodedEvent.name, args: {} });
    _.forEach(decodedEvent.events, arg => {
        logEvent.args[arg.name] = arg.value;
    });
    return logEvent;
}
