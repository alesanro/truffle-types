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
const fs_1 = require("fs");
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
    .example("npx dump-contracts --abiDir=./build/contracts --output=./dump-contracts.json", "Writes out contracts with ABI signatures").argv;
// -- load contracts
const abis = _1.loadContractAbiFromDirSync(args.abiDir);
const storage = new _1.AbiStorage(abis);
// -- save
fs_1.writeFileSync(args.output, JSON.stringify(storage.abis, undefined, "\t"), { encoding: "utf8" });
