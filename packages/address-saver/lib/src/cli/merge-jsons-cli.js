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
const deepmerge_1 = __importDefault(require("deepmerge"));
const fs_1 = require("fs");
const path_1 = require("path");
const yargs = __importStar(require("yargs"));
const args = yargs
    .option("source", {
    type: "string",
    demand: true,
    normalize: true,
    describe: "File path that should be merged into target"
})
    .option("target", {
    type: "string",
    demand: true,
    describe: "Target of the merge. If no '--output' will be provided then results will saved to target path"
})
    .option("output", {
    type: "string",
    demand: false,
    normalize: true,
    describe: "Output destination where merge resutls will be saved"
}).argv;
const inputs = {
    source: require(path_1.resolve(args.source)),
    target: require(path_1.resolve(args.target)),
};
const output = path_1.resolve(args.output ? args.ouput : args.target);
const merged = deepmerge_1.default(inputs.source, inputs.target);
fs_1.writeFileSync(output, JSON.stringify(merged, undefined, "\t"), { encoding: "utf8" });
process.exit(0);
