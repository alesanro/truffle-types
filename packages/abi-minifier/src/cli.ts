import * as yargs from "yargs";
import { minifyABI } from "./minify";

const args = yargs
    .option("buildDir", {
        alias: ["b"],
        describe: "Build directory with compiled contracts",
        type: "string",
        demandOption: false,
        default: "./build/contracts",
        normalize: true,
    })
    .option("outputDir", {
        alias: ["o"],
        describe: "Output directory with minified contracts",
        type: "string",
        demandOption: false,
        default: "./build/contracts-minified",
        normalize: true,
    })
    .option("postfix", {
        alias: ["p"],
        describe: "Postfix for minified contract artifacts",
        type: "string",
        demandOption: false,
        default: ""
    })
    .example(
        "$0 --buildDir ./build/contracts --outputDir ./build/contracts-minified",
        "Default command execution"
    )
    .example(
        "$0 --buildDir ./build/contracts --outputDir ./build/contracts-minified --postfix min",
        "Minify contracts with appending provided postfix"
    ).argv;

minifyABI(args.buildDir, args.outputDir, args.postfix);
