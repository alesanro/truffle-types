import * as yargs from "yargs";
import { exportDependenciesFromConfig, exportDependencies } from ".";

const args = yargs
    .option("config", {
        alias: "c",
        describe: "Config file",
        type: "string",
        normalize: true
    })
    .option("dest", {
        alias: "d",
        describe: "Destination directory for source files",
        type: "string",
        normalize: true
    })
    .option("input", {
        alias: "i",
        describe: "Input files to track and copy",
        type: "array"
    })
    .option("force", {
        alias: "f",
        describe: "Forces existed files to overwrite",
        type: "boolean"
    })
    .option("prefix", {
        alias: "p",
        describe: "Prefix that will be added to copied filenames",
        type: "string"
    })
    .example(
        `[bin] --config ./dep-contracts.json --force`,
        "Loads info from config file and overwrites files at destination"
    )
    .example(
        `[bin] --input @sc-contracts/build/artifacts --dest ./build/contracts`,
        "Gets files from provided input and copies them to destination directory"
    ).argv;

if (args.config) {
    const files = exportDependenciesFromConfig(args.config, {
        force: args.force || false
    });
    console.info(`--- Files generated from config ---`);
    console.dir(files);
} else if (args.input && args.dest) {
    const files = exportDependencies(args.input as string[], args.dest, {
        force: args.force || false,
        cwd: process.cwd(),
        prefix: args.prefix
    });
    console.info(`--- Files generated from source files ---`);
    console.dir(files);
} else {
    console.error("Non of valid options were provided");
}
