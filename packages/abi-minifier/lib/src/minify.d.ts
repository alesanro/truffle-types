/**
 * Minifies contracts' artifacts by excluding redundant properties and keeping artifacts small
 * @param contractsPath path where original artifacts stored
 * @param destinationPath destination path where to put minified artifacts
 * @param postfix optional: append provided postfix to artifact's filename. Warning: could disrupt other tools.
 *      Provide postfix only if destination path is the same as original path, otherwise skip it.
 */
export declare function minifyABI(contractsPath: string, destinationPath?: string, postfix?: string): void;
