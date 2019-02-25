import { readFileSync } from "fs";
import { sync as findSync } from "find-up";
import { dirname, resolve } from "path";
import { resolveOnlyExistedPaths } from "./path";

const DEFAULT_DEPENDENCY_CONFIG_NAME = "dep-contracts";

interface DependencyConfigOptions {
    [key: string]: any;
}

interface DepenendyConfigFileSchemeJson {
    contracts: string[];
    destinationDir: string;
}

abstract class Config {
    [prop: string]: any;

    readonly workdirPath: string;

    constructor(workdirPath?: string) {
        this.workdirPath = workdirPath || process.cwd();
    }

    protected static _normalize(obj: any): { [key: string]: any } {
        const clone: { [key: string]: any } = {};
        Object.keys(obj).forEach(key => {
            try {
                clone[key] = obj[key];
            } catch (e) {
                // Do nothing with values that throw.
            }
        });

        return clone;
    }

    protected _merge(obj: any): this {
        const clone = Config._normalize(obj);
        // Only set keys for values that don't throw.
        Object.keys(obj).forEach(key => {
            try {
                this[key] = clone[key];
            } catch (e) {
                // Do nothing.
            }
        }, this);
        return this;
    }
}

/**
 * Provides wrapper class for the tool.
 */
export class DependencyConfig extends Config implements DepenendyConfigFileSchemeJson {
    /**
     * List of resolved source files/directories from config file
     */
    readonly contracts: string[];
    /**
     * Destination dir from config file
     */
    readonly destinationDir: string;

    constructor(obj: DepenendyConfigFileSchemeJson, workingPath?: string) {
        super(workingPath);

        this.contracts = resolveOnlyExistedPaths(obj.contracts, {
            cwd: this.workdirPath,
        });
        this.destinationDir = resolve(this.workdirPath, obj.destinationDir);
    }

    /**
     * Automatically detects config file and loads it.
     * @param options options
     * @param filename config filename
     */
    public static detect(options: DependencyConfigOptions, filename?: string): DependencyConfig {
        const search = filename ? filename : [DEFAULT_DEPENDENCY_CONFIG_NAME];
        const file = findSync(search);
        if (file === null) {
            throw new Error("Could not find suitable configuration file");
        }

        return DependencyConfig.load(file, options);
    }

    /**
     * Loads configuration from provided file.
     * @param file full path to config file
     * @param options options
     */
    public static load(file: string, options: DependencyConfigOptions): DependencyConfig {
        const jsonConfig = <DepenendyConfigFileSchemeJson>JSON.parse(readFileSync(file, { encoding: "utf8" }));
        const config = new DependencyConfig(jsonConfig, dirname(resolve(file)));
        config._merge(options);

        return config;
    }
}
