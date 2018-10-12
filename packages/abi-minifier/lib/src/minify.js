"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const CONTRACT_ABI_POSTFIX = "min";
function normalizedPostfix(postfix) {
    return (postfix && postfix.length > 0) ? `.${postfix}.` : ".";
}
function minifyABI(contractsPath, destinationPath = contractsPath, postfix = CONTRACT_ABI_POSTFIX) {
    if (contractsPath === destinationPath && postfix.length === 0) {
        throw new Error("Cannot produce minified version to same location without applying any postfix");
    }
    if (!fs_1.existsSync(destinationPath)) {
        fs_1.mkdirSync(destinationPath);
    }
    postfix = normalizedPostfix(postfix);
    fs_1.readdirSync(contractsPath, "utf8")
        .map(file => path_1.resolve(path_1.join(contractsPath, file)))
        .map(contractPath => require(contractPath))
        .map(({ contractName, abi, bytecode, deployedBytecode, compiler, networks, schemaVersion, updatedAt, }) => ({ contractName, abi, bytecode, deployedBytecode, compiler, networks, schemaVersion, updatedAt, }))
        .forEach(contract => fs_1.writeFileSync(path_1.join(destinationPath, `${contract.contractName}${postfix}json`), JSON.stringify(contract)));
    console.info(`Artifacts minified!`);
    console.info(`Now they are placed in ${destinationPath}`);
}
exports.minifyABI = minifyABI;
