#!/usr/bin/env node

import * as yargs from "yargs";

import { AbiStorage, loadContractAbiFromDirSync } from "./";
import { writeFileSync } from "fs";


const args = yargs
    .option("abiDir", {
        type: "string",
        normalize: true,
        demandOption: true,
        default: "./build/contracts/",
    })
    .option("output", {
        type: "string",
        normalize: true,
        default: "./dump-contracts.json",
    })
    .example(
        "npx dump-contracts --abiDir=./build/contracts --output=./dump-contracts.json",
        "Writes out contracts with ABI signatures"
    ).argv;

// -- load contracts
const abis = loadContractAbiFromDirSync(args.abiDir);
const storage = new AbiStorage(abis);

// -- save
writeFileSync(args.output, JSON.stringify(storage.abis, undefined, "\t"), { encoding: "utf8" });

