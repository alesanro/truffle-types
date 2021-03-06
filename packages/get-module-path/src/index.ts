import { getInstalledPathSync } from "get-installed-path";

/**
 * Searches for a package and returns full path to it, throws otherwise
 * @throws
 * @param packageName package name to look for
 */
export function getModulePathSync(packageName: string): string {
    return getInstalledPathSync(packageName, {
        paths: process.mainModule!.paths
    });
}
