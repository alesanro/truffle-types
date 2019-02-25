import { resolveOnlyExistedPaths } from "./path";
import { DependencyConfig } from "./config";
import { statSync, readdirSync, copyFileSync, constants as fsConstants } from "fs";
import { resolve, parse } from "path";
import { sync as mkdirpSync } from "mkdirp";

export { DependencyConfig };

/**
 * Copies files from paths to destination directory
 * @param contractPaths list of paths to artifacts
 * @param dstDir destination dir
 * @param options options
 */
export function exportDependencies(
    contractPaths: string[],
    dstDir: string,
    options: { force: boolean; cwd: string },
): string[] {
    const resolvedContractPaths = resolveOnlyExistedPaths(contractPaths, options);

    return _exportDependencies(resolvedContractPaths, resolve(options.cwd, dstDir), options);
}

/**
 * Copies files from config
 * @param config config wrapper
 * @param options options
 */
export function exportDependenciesFromConfig(filename: string, options: { force: boolean }): string[] {
    const config = DependencyConfig.detect({}, filename);
    return _exportDependencies(config.contracts, config.destinationDir, options);
}

function _exportDependencies(resolvedContractPaths: string[], dstDir: string, options: { force: boolean }): string[] {
    const files = resolvePathsToFiles(resolvedContractPaths);
    const resultFiles: string[] = [];
    mkdirpSync(dstDir);

    files.forEach(file => {
        const destFile = resolve(dstDir, parse(file).base);
        try {
            copyFileSync(file, destFile, options.force ? undefined : fsConstants.COPYFILE_EXCL);
        } catch (e) {
            // it means file exists, just skip
        }

        resultFiles.push(destFile);
    });

    function resolvePathsToFiles(paths: string[]): string[] {
        const files: string[] = [];
        paths.forEach(path => {
            const stat = statSync(path);
            if (stat.isFile()) {
                files.push(path);
                return;
            }

            if (stat.isDirectory()) {
                const dirContent = readdirSync(path, {
                    withFileTypes: true,
                });

                dirContent.filter(entity => entity.isFile()).map(entity => files.push(resolve(path, entity.name)));
                return;
            }
        });
        return files;
    }

    return resultFiles;
}
