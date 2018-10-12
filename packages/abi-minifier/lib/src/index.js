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
const minify_1 = require("./minify");
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
    .example("$0 --buildDir ./build/contracts --outputDir ./build/contracts-minified", "Default command execution")
    .example("$0 --buildDir ./build/contracts --outputDir ./build/contracts-minified --postfix min", "Minify contracts with appending provided postfix").argv;
minify_1.minifyABI(args.buildDir, args.outputDir, args.postfix);
