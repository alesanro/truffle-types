"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function loadContractAbiFromDirSync(directoryPath) {
    const instances = [];
    const files = fs_1.readdirSync(directoryPath, { encoding: "utf8" });
    for (const abiFilePath of files) {
        const contractContent = fs_1.readFileSync(path_1.join(directoryPath, abiFilePath), { encoding: "utf8" });
        const { contractName, abi, } = JSON.parse(contractContent);
        instances.push({
            contractName,
            abi
        });
    }
    return instances;
}
exports.loadContractAbiFromDirSync = loadContractAbiFromDirSync;
