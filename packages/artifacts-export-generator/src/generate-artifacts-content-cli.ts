// #!npx run ./node_modules/.bin/ts-node

import { generateArtifactExports } from "./artifacts-export-content";
import { resolve } from "path";
// tslint:disable-next-line:no-implicit-dependencies
import * as yargs from "yargs";

const args = yargs
    .option("artifactsDir", {
        type: "string",
        normalize: true,
        demandOption: true,
    })
    .option("destination", {
        type: "string",
        normalize: true,
        demandOption: true,
    })
    .options("exclude", {
        type: "array",
        demandOption: false,
    }).argv;

generateArtifactExports(resolve(args.artifactsDir), resolve(args.destination), args.exclude as string[]);
