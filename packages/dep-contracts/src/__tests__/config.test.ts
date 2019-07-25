import { parse, isAbsolute } from "path";

import { DependencyConfig } from "../config";
import {
    SAMPLES_DIR,
    EMPTY_PREFIX,
    CONFIG_FILENAME_START_WITH_REGEX,
    CONFIG_FOLDER_START_WITH_REGEX
} from "./constants";
import { unique } from "./utils";

test("relative files' paths without prefix", () => {
    const dependencyFilename = "dep-relative.json";
    const config = DependencyConfig.detect({}, dependencyFilename, {
        cwd: SAMPLES_DIR
    });

    expect(config.contracts.length).toEqual(2);
    for (const contractScheme of config.contracts) {
        expect(contractScheme.prefix).toEqual(EMPTY_PREFIX);
        expect(isAbsolute(contractScheme.path)).toBeTruthy();
        expect(parse(contractScheme.path).base).toMatch(
            CONFIG_FILENAME_START_WITH_REGEX
        );
    }
    expectUniqueContractRecords(config);
});

// test("relative files' paths with one prefix", () => {
//     const dependencyFilename = "dep-relative-prefixed.json";
//     const config = DependencyConfig.detect({}, dependencyFilename, {
//         cwd: SAMPLES_DIR
//     });

//     expect(config.contracts.length).toEqual(2);
//     for (const contractScheme of config.contracts) {
//         expect(contractScheme.prefix).not.toBeUndefined();
//         expect(isAbsolute(contractScheme.path)).toBeTruthy();
//         expect(parse(contractScheme.path).base).toMatch(CONFIG_FILENAME_REGEX);
//     }
//     expect(config.contracts[0].prefix).not.toEqual(EMPTY_PREFIX);
//     expect(config.contracts[1].prefix).toEqual(EMPTY_PREFIX);

//     expectUniqueContractRecords(config);
// });

// test("relative files' paths with not existed files", () => {
//     const dependencyFilename = "dep-relative-not-existed.json";
//     const config = DependencyConfig.detect({}, dependencyFilename, {
//         cwd: SAMPLES_DIR
//     });

//     expect(config.contracts.length).toEqual(1);
//     for (const contractScheme of config.contracts) {
//         expect(contractScheme.prefix).toEqual(EMPTY_PREFIX);
//         expect(isAbsolute(contractScheme.path)).toBeTruthy();
//         expect(parse(contractScheme.path).base).toMatch(CONFIG_FILENAME_REGEX);
//     }

//     expect(parse(config.contracts[0].path).base).toEqual("file2.txt");

//     expectUniqueContractRecords(config);
// });

// test("relative files' paths with mixed prefixes", () => {
//     const dependencyFilename = "dep-relative-mixed-prefixed.json";
//     const config = DependencyConfig.detect({}, dependencyFilename, {
//         cwd: SAMPLES_DIR
//     });

//     expect(config.contracts.length).toEqual(2);
//     for (const contractScheme of config.contracts) {
//         expect(contractScheme.prefix).not.toBeUndefined();
//         expect(contractScheme.prefix).not.toEqual(EMPTY_PREFIX);
//         expect(isAbsolute(contractScheme.path)).toBeTruthy();
//     }

//     expect(parse(config.contracts[0].path).base).toMatch(CONFIG_FOLDER_REGEX);
//     expect(parse(config.contracts[1].path).base).toMatch(CONFIG_FILENAME_REGEX);

//     expect(config.contracts[0].prefix).not.toEqual(config.contracts[1].prefix);

//     expectUniqueContractRecords(config);
// });

// test("relative files' paths with folder", () => {
//     const dependencyFilename = "dep-relative-folder.json";
//     const config = DependencyConfig.detect({}, dependencyFilename, {
//         cwd: SAMPLES_DIR
//     });

//     expect(config.contracts.length).toEqual(1);
//     for (const contractScheme of config.contracts) {
//         expect(contractScheme.prefix).not.toBeUndefined();
//         expect(isAbsolute(contractScheme.path)).toBeTruthy();
//     }

//     expect(parse(config.contracts[0].path).base).toMatch(CONFIG_FOLDER_REGEX);

//     expectUniqueContractRecords(config);
// });

// test("relative files' paths with prefixed folder", () => {
//     const dependencyFilename = "dep-relative-folder-prefixed.json";
//     const config = DependencyConfig.detect({}, dependencyFilename, {
//         cwd: SAMPLES_DIR
//     });

//     expect(config.contracts.length).toEqual(1);
//     for (const contractScheme of config.contracts) {
//         expect(contractScheme.prefix).not.toBeUndefined();
//         expect(contractScheme.prefix).not.toEqual(EMPTY_PREFIX);
//         expect(isAbsolute(contractScheme.path)).toBeTruthy();
//     }

//     expect(parse(config.contracts[0].path).base).toMatch(CONFIG_FOLDER_REGEX);

//     expectUniqueContractRecords(config);
// });

// test("relative files' paths with not existed folder", () => {
//     const dependencyFilename = "dep-relative-folder-not-existed.json";
//     const config = DependencyConfig.detect({}, dependencyFilename, {
//         cwd: SAMPLES_DIR
//     });

//     expect(config.contracts.length).toEqual(0);
//     expectUniqueContractRecords(config);
// });

// test("relative files' paths with package", () => {
//     const dependencyFilename = "dep-package.json";
//     const config = DependencyConfig.detect({}, dependencyFilename, {
//         cwd: SAMPLES_DIR
//     });

//     expect(config.contracts.length).toEqual(1);
//     for (const contractScheme of config.contracts) {
//         expect(contractScheme.prefix).not.toBeUndefined();
//         expect(isAbsolute(contractScheme.path)).toBeTruthy();
//     }

//     expectUniqueContractRecords(config);
// });

function expectUniqueContractRecords(config: DependencyConfig) {
    expect(unique(config.contracts.map(item => item.path)).length).toEqual(
        config.contracts.length
    );
}
