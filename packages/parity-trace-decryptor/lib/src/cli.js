#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = __importStar(require("yargs"));
const _1 = require("./");
const address_saver_1 = require("@truffle-types/address-saver");
const fs_1 = require("fs");
const args = yargs
    .option("abiDir", {
    type: "string",
    normalize: true,
    demandOption: true,
    default: "./build/contracts/",
})
    .option("trace", {
    type: "string",
    normalize: true,
    demandOption: true,
})
    .option("output", {
    type: "string",
    normalize: true,
    demandOption: true,
    default: "./decryted-trace.json",
})
    .option("deployedAddresses", {
    type: "string",
    normalize: true,
    demandOption: false,
})
    .option("networkId", {
    type: "number",
    demandOption: false,
    default: 88,
    describe: "Network ID where deployed addresses will be taken from",
})
    .options("pretty", {
    type: "boolean",
    default: false,
    describe: "Prints prettified trace log"
})
    .example("npx parity-trace-decryptor --abiDir=./build/contracts --trace=./trace-stage.json --output=./trace-decrypted-stage.json --deployedAddresses=./deployed-addresses.json --networkId=88", "Defaut trace decryption for network '88' and writing results to ./trace-decrypted-stage.json").argv;
let deployedAddresses;
if (args.deployedAddresses) {
    deployedAddresses = address_saver_1.readDeployedArtifactsSync(args.deployedAddresses);
}
let deployedContracts;
if (deployedAddresses && args.networkId) {
    deployedContracts = deployedAddresses[args.networkId];
    if (!deployedContracts) {
        console.warn(`No deployed addresses found for network ID ${args.networkId}`);
    }
}
let deployedContractTuples;
if (deployedContracts !== undefined) {
    const contracts = deployedContracts;
    deployedContractTuples = Object.keys(contracts).map(k => contracts[k]);
}
// -- load contracts
const traceOutput = JSON.parse(fs_1.readFileSync(args.trace, { encoding: "utf8" }));
const abis = _1.loadContractAbiFromDirSync(args.abiDir);
// -- decrypt trace
const storage = new _1.AbiStorage(abis);
const decryptor = new _1.TraceDecryptor(storage);
const decrypted = decryptor.decrypt(traceOutput, deployedContractTuples);
const triedTrace = _1.TraceDecryptor.buildTrace(decrypted);
// -- save
fs_1.writeFileSync(args.output, JSON.stringify(triedTrace, undefined, "\t"), { encoding: "utf8" });
// -- print output if needed
if (args.pretty) {
    _1.printTree(triedTrace, console);
}
