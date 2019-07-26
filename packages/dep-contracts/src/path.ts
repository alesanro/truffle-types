import { getModulePathSync } from "@truffle-types/get-module-path";
import { resolve, sep, parse } from "path";
import { statSync } from "fs";

/**
 * Resolves provided path by searching locally or
 *  in node_modules (in case of package name prefix)
 * @param path path or package name
 * @param options optionally provided settings
 * @returns string if path was successfully resolved
 */
export function resolvePathSync(
    path: string,
    options: { cwd?: string }
): string | undefined {
    const cwd = options.cwd || process.env.CWD!;
    const parsedPath = parse(path);

    if (isLocalPath(resolve(cwd, path))) {
        return resolve(cwd, path);
    }

    // if == true then directory is right but there is no such file
    if (isLocalPath(resolve(cwd, parsedPath.dir))) {
        return undefined;
    }

    try {
        const packageName = parsedPath.dir.split(sep, 2).join(sep);
        const packagePath = getModulePathSync(packageName);
        const packageRootDir = packagePath.slice(0, -packageName.length);
        return resolve(packageRootDir, path);
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

/**
 * Resolves provided paths and returns compact result (without undefined one)
 * @param paths list of paths to try to resolve
 * @param options options
 */
export function resolveOnlyExistedPaths(
    paths: string[],
    options: { cwd: string }
): string[] {
    return paths
        .map(path => {
            return resolvePathSync(path, options);
        })
        .filter(value => value !== undefined && value !== null) as string[];
}

function isLocalPath(path: string): boolean {
    try {
        const stat = statSync(path);
        return stat.isDirectory() || stat.isFile();
    } catch (e) {
        return false;
    }
}
