#!/usr/bin/env node

import * as _ from 'lodash';
import * as Handlebars from 'handlebars';
import * as yargs from 'yargs';
import chalk from 'chalk';
import { pascalize } from 'humps';
import { sync as globSync } from 'glob';
import { TemplateContext, Contract, } from './types'

import { readdirSync, readFileSync, writeFileSync } from "fs";
import * as path from 'path';

const DEFAULT_CONTRACT_POSTFIX = 'Instance';
const ALLOWED_EXTENSIONS = ['.ts'];
const ARTIFACTS_EXPORT_TEMPLATE_FILE = 'artifacts-export-template.handlebars';
const CONTRACTS_EXPORT_TEMPLATE_FILE = 'contracts-export-template.handlebars';

const args = yargs
    .option('inputFolder', {
        alias: ['i'],
        describe: 'Folder with generated contracts',
        type: 'string',
        normalize: true,
        demandOption: true,
    })
    .option('output', {
        alias: ['o', 'out'],
        describe: 'Output folder for artifacts module',
        type: 'string',
        normalize: true,
        demandOption: true,
    })
    .option('postfix', {
        alias: ['p'],
        describe: 'Pass postfix format for contracts to be exported from contracts definitions',
        type: 'string',
    })
    .option('exclude', {
        alias: ['e'],
        describe: 'Skips provided files/templates in folder with generated contracts',
        type: 'array',
    })
    .option('templates', {
        alias: ['t'],
        describe: 'Provides templates\' folder',
        type: 'string',
        normalize: true,
        demandOption: true,
    })
    .option('artifacts', {
        alias: ['a'],
        describe: 'Folder with artifacts to check correctness of contracts\' names',
        type: 'string',
        normalize: true,
    })
    .options('contractNames', {
        alias: ['cn'],
        describe: 'List of contract names to verify correctnes of contracts',
        type: 'array',
    })
    .conflicts('artifacts', 'contractNames')
    .example(
        "$0 --inputFolder='src/generated/contracts/' --output=src/generated/ --postfix Instance --exclude='index*' 'artifacts.js' --templates=./scripts/ --artifacts=./build/contracts/ ",
        'Full using example, where folder with artifacts provided'
    )
    .example(
        "$0 --inputFolder='src/generated/contracts/' --output=src/generated/ --postfix Instance --exclude='index*' 'artifacts.js' --templates=./scripts/ --contractNames=FakeCoin Migrations ",
        'Full using example, where names of contracts provided'
    )
    .argv;

// ------------ get input generated contract files ----------------------
const inputFiles: string[] = readdirSync(args.inputFolder, "utf8");

if (_.isEmpty(inputFiles)) {
    console.log(`${chalk.red(`No contracts found in ${args.inputFolder} folder`)}`);
    console.log(`Please make sure that you've generated any contracts first.`);
    process.exit(1);
}


// ------------------- get excluded files ---------------------
const excludedFiles = getExcludedFiles(args.inputFolder, args.exclude)
console.log(`Files excluded: ${excludedFiles.length > 0 ? chalk.redBright(`${excludedFiles}`) : `no files found`}.`)


// ----------- get the rest of the files -----------------
const gotContracts: string[] = getProvidedContractNames(args.artifacts, args.contractNames)
const includedFiles = _.filter(inputFiles, file => {
    return _.includes(ALLOWED_EXTENSIONS, path.extname(file)) &&
    !_.includes(excludedFiles, file);
})
const artifactNames = _.map(includedFiles, file => {
    const filename = path.basename(file, path.extname(file))
    const artifactName = pascalize(`${filename}`)
    return artifactName
})

// ----------- get selected by user contracts -----------------
const contractPostfix = pascalize(args.postfix || DEFAULT_CONTRACT_POSTFIX)
const contracts: Contract[] = _.zipWith<string, string, [string, string]>(includedFiles, artifactNames, (v1, v2) => [v1, v2])
.filter(([, artifactName])  => {
    return _.includes(gotContracts, artifactName)
})
.map(([file, artifactName]) => {
    const filename = path.basename(file, path.extname(file))
    const contractInstanceName = pascalize(`${artifactName}${contractPostfix}`);
    return <Contract>{
        filename: filename,
        contractArtifactName: artifactName,
        contractInstanceName: contractInstanceName,
        contractLibRelativePath: `./${filename}`,
    };
})

if (_.isEmpty(contracts)) {
    console.log(`${chalk.red(`Cannot receive contracts that are available for exporting (neither excluded or not included)`)}`)
    process.exit(1)
}

console.log(`${chalk.underline(`Got contracts:`)}`)
_.forEach(contracts, (contract) => {
    console.log(`- ${chalk.gray(contract.filename)} => ${chalk.green(`${contract.contractArtifactName}`)} (${chalk.bgGreen(`${contract.contractInstanceName}`)})`)
})

/// ----------- initialize template context ----------
const templateContext = <TemplateContext>{
    contracts: contracts,
    generatedDir: `./${path.relative(args.output, args.inputFolder)}`
}

/// ------------ fill CONTRACTS templates ------------
console.log(`Start writes of ${chalk.bold(`contracts`)} exports...`)

const contractsTemplatePath = path.resolve(path.join(args.templates, CONTRACTS_EXPORT_TEMPLATE_FILE))
const contractsTemplateContent = getNamedContent(contractsTemplatePath)
const contractsTemplate = Handlebars.compile<TemplateContext>(contractsTemplateContent.content)
const renderedContractsTemplate = contractsTemplate(templateContext)

const contractsOutputPath = path.join(args.inputFolder, 'index.ts');
writeFileSync(contractsOutputPath, renderedContractsTemplate)

console.log(`${chalk.bold(`Contracts`)} exports successfully was written to ${chalk.underline(`${path.resolve(contractsOutputPath)}`)}`)

/// ------------ fill ARTIFACTS templates ------------
console.log(`Start writes of ${chalk.bold(`artifacts`)} exports...`)

const artifactsTemplatePath = path.resolve(path.join(args.templates, ARTIFACTS_EXPORT_TEMPLATE_FILE))
const artifactsTemplateContent = getNamedContent(artifactsTemplatePath)
const artifactsTemplate = Handlebars.compile<TemplateContext>(artifactsTemplateContent.content)
const renderedArtifactsTemplate = artifactsTemplate(templateContext)

const artifactsOutputPath = path.join(args.output, 'artifacts.d.ts');
writeFileSync(artifactsOutputPath, renderedArtifactsTemplate)

console.log(`${chalk.bold(`Artifacts`)} exports successfully was written to ${chalk.underline(`${path.resolve(artifactsOutputPath)}`)}`)

/// ----------------------------------------
/// ----------- local function -------------

function getNamedContent(filename: string): { name: string; content: string } {
    const name = path.basename(filename);
    try {
        const content = readFileSync(filename).toString();
        return {
            name,
            content,
        };
    } catch (err) {
        throw new Error(`Failed to read ${filename}: ${err}`);
    }
}

function getExcludedFiles(folder: string, patterns: string[]): string[] {
    const excludePatters = patterns || [];
    const excludedFiles = _.map(excludePatters, (pattern) => {
        console.log(`Perform search pattern to exclude: ${pattern}`)
        return globSync(pattern, { cwd: folder })
    })
    return _.flatten(excludedFiles)
}

function getProvidedContractNames(artifactsPath: string, contractsList: string[]): string[] | never {
    if (!_.isEmpty(args.artifacts)) {
        const contractArtifactsFiles = readdirSync(args.artifacts, "utf8");
        return _.map(contractArtifactsFiles, file => path.basename(file, path.extname(file)))
    }
    else if (!_.isEmpty(args.contractNames)) {
        return args.contractNames
    }

    console.log(`${chalk.red(`No contracts passed with "--artifacts" or "--contractNames" params`)}`)
    console.log(`Please make sure that you provide path to artifacts or list of smart contracts.`)
    return process.exit(1)
}
