import deepmerge from "deepmerge";
import { writeFileSync } from "fs";
import { resolve } from "path";
import * as yargs from "yargs";

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
    source: require(resolve(args.source)),
    target: require(resolve(args.target)),
};
const output = resolve(args.output ? args.ouput : args.target);
const merged = deepmerge(inputs.source, inputs.target);

writeFileSync(output, JSON.stringify(merged, undefined, "\t"), { encoding: "utf8" });

process.exit(0);
