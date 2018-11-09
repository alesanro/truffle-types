import { ContractInterface } from "./types";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export function loadContractAbiFromDirSync(directoryPath: string): ContractInterface[] {
    const instances = [] as ContractInterface[];

    const files = readdirSync(directoryPath, { encoding: "utf8" });
    for (const abiFilePath of files) {
        const contractContent = readFileSync(join(directoryPath, abiFilePath), { encoding: "utf8" });
        const { contractName, abi, } = JSON.parse(contractContent);
        instances.push({
            contractName,
            abi
        });
    }

    return instances;
}
