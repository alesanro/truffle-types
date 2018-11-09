#!/usr/bin/env node

import * as yargs from "yargs";

import { TraceDecryptor, AbiStorage, loadContractAbiFromDirSync, printTree } from "./";
import { TraceOutput, DeployedContractTyple, DecryptedTrace, DecryptedTreeTrace } from "./types";
import { readDeployedArtifactsSync, ArtifactRecord, NetworkArtifacts } from "@truffle-types/address-saver";
import { readFileSync, writeFileSync } from "fs";


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
    .example(
        "npx parity-trace-decryptor --abiDir=./build/contracts --trace=./trace-stage.json --output=./trace-decrypted-stage.json --deployedAddresses=./deployed-addresses.json --networkId=88",
        "Defaut trace decryption for network '88' and writing results to ./trace-decrypted-stage.json"
    ).argv;

let deployedAddresses;
if (args.deployedAddresses) {
    deployedAddresses = readDeployedArtifactsSync(args.deployedAddresses);
}

let deployedContracts: NetworkArtifacts | undefined;
if (deployedAddresses && args.networkId) {
    deployedContracts = deployedAddresses[args.networkId];

    if (!deployedContracts) {
        console.warn(`No deployed addresses found for network ID ${args.networkId}`);
    }
}

let deployedContractTuples: DeployedContractTyple[] | undefined;
if (deployedContracts !== undefined) {
    const contracts = deployedContracts;
    deployedContractTuples = Object.keys(contracts).map(k => contracts[k]);
}

// -- load contracts
const traceOutput = JSON.parse(readFileSync(args.trace, { encoding: "utf8" })) as TraceOutput;
const abis = loadContractAbiFromDirSync(args.abiDir);


// -- decrypt trace
const storage = new AbiStorage(abis);
const decryptor = new TraceDecryptor(storage);

const decrypted = decryptor.decrypt(traceOutput, deployedContractTuples);
const triedTrace = TraceDecryptor.buildTrace(decrypted);

// -- save
writeFileSync(args.output, JSON.stringify(triedTrace, undefined, "\t"), { encoding: "utf8" });

// -- print output if needed
if (args.pretty) {
    printTree(triedTrace as DecryptedTreeTrace<DecryptedTrace>[], console);
}
