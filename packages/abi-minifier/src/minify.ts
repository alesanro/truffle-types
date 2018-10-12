import { readdirSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, resolve } from "path";
import { ContractAbi } from "./types";

const CONTRACT_ABI_POSTFIX = "min";

function normalizedPostfix(postfix: string | undefined): string {
    return (postfix && postfix.length > 0) ?  `.${postfix}.` : ".";
}

/**
 * Minifies contracts' artifacts by excluding redundant properties and keeping artifacts small
 * @param contractsPath path where original artifacts stored
 * @param destinationPath destination path where to put minified artifacts
 * @param postfix optional: append provided postfix to artifact's filename. Warning: could disrupt other tools.
 *      Provide postfix only if destination path is the same as original path, otherwise skip it.
 */
export function minifyABI(contractsPath: string, destinationPath = contractsPath, postfix = CONTRACT_ABI_POSTFIX): void {
    if (contractsPath === destinationPath && postfix.length === 0) {
        throw new Error("Cannot produce minified version to same location without applying any postfix");
    }

    if (!existsSync(destinationPath)) {
        mkdirSync(destinationPath);
    }

    postfix = normalizedPostfix(postfix);
    readdirSync(contractsPath, "utf8")
        .map(file => resolve(join(contractsPath, file)))
        .map(contractPath => <ContractAbi>require(contractPath))
        .map(({ contractName, abi, bytecode, deployedBytecode, compiler, networks, schemaVersion, updatedAt, }) => ({ contractName, abi, bytecode, deployedBytecode, compiler, networks, schemaVersion, updatedAt, }))
        .forEach(contract => writeFileSync(join(destinationPath, `${contract.contractName}${postfix}json`), JSON.stringify(contract)));

    console.info(`Artifacts minified!`);
    console.info(`Now they are placed in ${destinationPath}`);
}

