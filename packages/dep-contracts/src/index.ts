import { resolveOnlyExistedPaths } from "./path";
import { DependencyConfig } from "./config";
import {
    statSync,
    readdirSync,
    copyFileSync,
    constants as fsConstants
} from "fs";
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
    options: { force: boolean; cwd: string; prefix?: string }
): string[] {
    const resolvedContractPaths = resolveOnlyExistedPaths(
        contractPaths,
        options
    );

    return _exportDependencies(
        resolvedContractPaths.map(p => ({
            path: p,
            prefix: typeof options.prefix === "string" ? options.prefix : ""
        })),
        resolve(options.cwd, dstDir),
        options
    );
}

/**
 * Copies files from config
 * @param config config wrapper
 * @param options options
 */
export function exportDependenciesFromConfig(
    filename: string,
    options: { force: boolean; cwd?: string }
): string[] {
    const config = DependencyConfig.detect(
        {},
        filename,
        options.cwd ? { cwd: options.cwd } : undefined
    );
    return _exportDependencies(
        config.contracts,
        config.destinationDir,
        options
    );
}

function _exportDependencies(
    resolvedContractPaths: { path: string; prefix: string }[],
    dstDir: string,
    options: { force: boolean }
): string[] {
    const files = resolvePathsToFiles(resolvedContractPaths);
    const resultFiles: string[] = [];
    mkdirpSync(dstDir);

    files.forEach(file => {
        const parsedPath = parse(file.file);
        const destFile = resolve(
            dstDir,
            `${file.prefix}${parsedPath.name}${parsedPath.ext}`
        );
        try {
            copyFileSync(
                file.file,
                destFile,
                options.force ? undefined : fsConstants.COPYFILE_EXCL
            );
        } catch (e) {
            // it means file exists, just skip
        }

        resultFiles.push(destFile);
    });

    function resolvePathsToFiles(
        paths: { path: string; prefix: string }[]
    ): { file: string; prefix: string }[] {
        const files: { file: string; prefix: string }[] = [];
        paths.forEach(item => {
            const stat = statSync(item.path);
            if (stat.isFile()) {
                files.push({ file: item.path, prefix: item.prefix });
                return;
            }

            if (stat.isDirectory()) {
                const dirContent = readdirSync(item.path, {
                    withFileTypes: true
                });

                dirContent
                    .filter(entity => entity.isFile())
                    .map(entity =>
                        files.push({
                            file: resolve(item.path, entity.name),
                            prefix: item.prefix
                        })
                    );
                return;
            }
        });
        return files;
    }

    return resultFiles;
}
