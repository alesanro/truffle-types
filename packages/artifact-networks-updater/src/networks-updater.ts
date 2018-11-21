import { writeFileSync, readdirSync } from "fs";
import { resolve, join } from "path";
import * as _ from "lodash";
import { sync as globSync } from "glob";
import { ContractAbi } from "./types";

export function moveAndWriteNetworkForSingleArtifactFile(source: string, target: string) {
    const sourceFilePath = resolve(source);
    const targetFilePath = resolve(target);

    console.info(`[artifact-networks-updater] Start to update networks for ${source} => ${target}...`);
    _moveAndWriteNetworkForSingleArtifactFile(sourceFilePath, targetFilePath);
    console.info(`[artifact-networks-updater] Done! Networks updated for ${source} => ${target}.`);
}

export function moveAndWriteNetworkForArtifactsDir(sourceDir: string, targetDir: string, exclude?: string) {
    const sourceFiles = readdirSync(sourceDir, "utf8");
    const targetFiles = readdirSync(targetDir, "utf8");

    const excludedFiles = exclude ? getExcludedFiles(sourceDir, [exclude]) : [];

    for (const sourceFile of sourceFiles) {
        if (excludedFiles.findIndex(excludeFile => sourceFile === excludeFile) !== -1) {
            console.info(`[artifact-networks-updater] Exclude file ${sourceFile}`);
            continue;
        }

        if (targetFiles.findIndex(targetFile => targetFile === sourceFile) !== -1) {
            moveAndWriteNetworkForSingleArtifactFile(join(sourceDir, sourceFile), join(targetDir, sourceFile));
        }
    }
}

function _moveNetworkForSingleArtifact(source: ContractAbi, target: ContractAbi): ContractAbi {
    const { networks } = source;
    const result = target;
    result.networks = networks;
    console.info(`[artifact-networks-updater] Network to update ${JSON.stringify(networks, undefined, "+")}`);
    return result;
}

function _moveAndWriteNetworkForSingleArtifactFile(sourceFile: string, targetFile: string) {
    const source = require(sourceFile) as ContractAbi;
    const target = require(targetFile) as ContractAbi;
    const result = _moveNetworkForSingleArtifact(source, target);

    writeFileSync(targetFile, JSON.stringify(result, undefined, "\t"), { encoding: "utf8" });
}

function getExcludedFiles(folder: string, patterns: string[]): string[] {
    const excludePatters = patterns || [];
    const excludedFiles = _.map(excludePatters, (pattern) => {
        console.info(`Perform search pattern to exclude: ${pattern}`);
        return globSync(pattern, { cwd: folder });
    });
    return _.flatten(excludedFiles);
}
