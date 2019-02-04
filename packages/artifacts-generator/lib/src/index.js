#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const Handlebars = __importStar(require("handlebars"));
const yargs = __importStar(require("yargs"));
const chalk_1 = __importDefault(require("chalk"));
const humps_1 = require("humps");
const glob_1 = require("glob");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const DEFAULT_CONTRACT_POSTFIX = "Instance";
const ALLOWED_EXTENSIONS = [".ts"];
const ARTIFACTS_EXPORT_TEMPLATE_FILE = "artifacts-export-template.handlebars";
const CONTRACTS_EXPORT_TEMPLATE_FILE = "contracts-export-template.handlebars";
const args = yargs
    .option("inputFolder", {
    alias: ["i"],
    describe: "Folder with generated contracts",
    type: "string",
    normalize: true,
    demandOption: true,
})
    .option("output", {
    alias: ["o", "out"],
    describe: "Output folder for artifacts module",
    type: "string",
    normalize: true,
    demandOption: true,
})
    .option("postfix", {
    alias: ["p"],
    describe: "Pass postfix format for contracts to be exported from contracts definitions",
    type: "string",
})
    .option("exclude", {
    alias: ["e"],
    describe: "Skips provided files/templates in folder with generated contracts",
    type: "array",
})
    .option("templates", {
    alias: ["t"],
    describe: "Provides templates' folder",
    type: "string",
    normalize: true,
    demandOption: true,
})
    .option("artifacts", {
    alias: ["a"],
    describe: "Folder with artifacts to check correctness of contracts' names",
    type: "string",
    normalize: true,
})
    .options("contractNames", {
    alias: ["cn"],
    describe: "List of contract names to verify correctnes of contracts",
    type: "array",
})
    .conflicts("artifacts", "contractNames")
    .example("$0 --inputFolder='src/generated/contracts/' --output=src/generated/ --postfix Instance --exclude='index*' 'artifacts.js' --templates=./scripts/ --artifacts=./build/contracts/ ", "Full using example, where folder with artifacts provided")
    .example("$0 --inputFolder='src/generated/contracts/' --output=src/generated/ --postfix Instance --exclude='index*' 'artifacts.js' --templates=./scripts/ --contractNames=FakeCoin Migrations ", "Full using example, where names of contracts provided")
    .argv;
// ------------ get input generated contract files ----------------------
const inputFiles = fs_1.readdirSync(args.inputFolder, "utf8");
if (_.isEmpty(inputFiles)) {
    console.log(`${chalk_1.default.red(`No contracts found in ${args.inputFolder} folder`)}`);
    console.log(`Please make sure that you've generated any contracts first.`);
    process.exit(1);
}
// ------------------- get excluded files ---------------------
const excludedFiles = getExcludedFiles(args.inputFolder, args.exclude || []);
console.log(`Files excluded: ${excludedFiles.length > 0 ? chalk_1.default.redBright(`${excludedFiles}`) : `no files found`}.`);
// ----------- get the rest of the files -----------------
const gotContracts = getProvidedContractNames(args.artifacts || "", args.contractNames || []);
const includedFiles = _.filter(inputFiles, file => {
    return _.includes(ALLOWED_EXTENSIONS, path.extname(file)) &&
        !_.includes(excludedFiles, file);
});
const artifactNames = _.map(includedFiles, file => {
    const filename = path.basename(file, path.extname(file));
    const artifactName = humps_1.pascalize(`${filename}`);
    return artifactName;
});
// ----------- get selected by user contracts -----------------
const gotContractsLowercased = _.map(gotContracts, contract => contract.toLowerCase());
const contractPostfix = humps_1.pascalize(args.postfix || DEFAULT_CONTRACT_POSTFIX);
const contracts = _.zipWith(includedFiles, artifactNames, (v1, v2) => [v1, v2])
    .filter(([, artifactName]) => {
    return _.includes(gotContractsLowercased, artifactName.toLowerCase());
})
    .map(([file, artifactNames]) => {
    const foundIndex = _.findIndex(gotContractsLowercased, contractName => contractName === artifactNames.toLowerCase());
    return [file, gotContracts[foundIndex]];
})
    .map(([file, artifactName]) => {
    const filename = path.basename(file, path.extname(file));
    const contractInstanceName = humps_1.pascalize(`${artifactName}${contractPostfix}`);
    return {
        filename,
        contractArtifactName: artifactName,
        contractInstanceName,
        contractLibRelativePath: `./${filename}`,
    };
});
if (_.isEmpty(contracts)) {
    console.log(`${chalk_1.default.red(`Cannot receive contracts that are available for exporting (neither excluded or not included)`)}`);
    process.exit(1);
}
console.log(`${chalk_1.default.underline(`Got contracts:`)}`);
_.forEach(contracts, (contract) => {
    console.log(`- ${chalk_1.default.gray(contract.filename)} => ${chalk_1.default.green(`${contract.contractArtifactName}`)} (${chalk_1.default.bgGreen(`${contract.contractInstanceName}`)})`);
});
/// ----------- initialize template context ----------
const templateContext = {
    contracts,
    generatedDir: `./${path.relative(args.output, args.inputFolder)}`
};
/// ------------ fill CONTRACTS templates ------------
console.log(`Start writes of ${chalk_1.default.bold(`contracts`)} exports...`);
const contractsTemplatePath = path.resolve(path.join(args.templates, CONTRACTS_EXPORT_TEMPLATE_FILE));
const contractsTemplateContent = getNamedContent(contractsTemplatePath);
const contractsTemplate = Handlebars.compile(contractsTemplateContent.content);
const renderedContractsTemplate = contractsTemplate(templateContext);
const contractsOutputPath = path.join(args.inputFolder, "index.ts");
fs_1.writeFileSync(contractsOutputPath, renderedContractsTemplate);
console.log(`${chalk_1.default.bold(`Contracts`)} exports successfully was written to ${chalk_1.default.underline(`${path.resolve(contractsOutputPath)}`)}`);
/// ------------ fill ARTIFACTS templates ------------
console.log(`Start writes of ${chalk_1.default.bold(`artifacts`)} exports...`);
const artifactsTemplatePath = path.resolve(path.join(args.templates, ARTIFACTS_EXPORT_TEMPLATE_FILE));
const artifactsTemplateContent = getNamedContent(artifactsTemplatePath);
const artifactsTemplate = Handlebars.compile(artifactsTemplateContent.content);
const renderedArtifactsTemplate = artifactsTemplate(templateContext);
const artifactsOutputPath = path.join(args.output, "artifacts.d.ts");
fs_1.writeFileSync(artifactsOutputPath, renderedArtifactsTemplate);
console.log(`${chalk_1.default.bold(`Artifacts`)} exports successfully was written to ${chalk_1.default.underline(`${path.resolve(artifactsOutputPath)}`)}`);
/// ----------------------------------------
/// ----------- local function -------------
function getNamedContent(filename) {
    const name = path.basename(filename);
    try {
        const content = fs_1.readFileSync(filename).toString();
        return {
            name,
            content,
        };
    }
    catch (err) {
        throw new Error(`Failed to read ${filename}: ${err}`);
    }
}
function getExcludedFiles(folder, patterns) {
    const excludePatters = patterns || [];
    const excludedFiles = _.map(excludePatters, (pattern) => {
        console.log(`Perform search pattern to exclude: ${pattern}`);
        return glob_1.sync(pattern, { cwd: folder });
    });
    return _.flatten(excludedFiles);
}
function getProvidedContractNames(artifactsPath, contractsList) {
    if (!_.isEmpty(args.artifacts)) {
        const contractArtifactsFiles = fs_1.readdirSync(args.artifacts, "utf8");
        return _.map(contractArtifactsFiles, file => path.basename(file, path.extname(file)));
    }
    else if (!_.isEmpty(args.contractNames)) {
        return args.contractNames;
    }
    console.log(`${chalk_1.default.red(`No contracts passed with "--artifacts" or "--contractNames" params`)}`);
    console.log(`Please make sure that you provide path to artifacts or list of smart contracts.`);
    return process.exit(1);
}
