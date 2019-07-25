import { existsSync } from "fs";
import { join, resolve, parse } from "path";
import { sync as rimrafSync } from "rimraf";
import {
    SAMPLES_DIR,
    CONFIG_FILENAME_START_WITH_REGEX,
    CONFIG_FILENAME_CONTAINS_REGEX
} from "./constants";
import { DependencyConfig } from "..";
import { exportDependenciesFromConfig } from "../index";
import { unique } from "./utils";

afterEach(() => {
    rimrafSync(resolve(join(SAMPLES_DIR, "build")));
});

test("relative files' paths without prefix", () => {
    const dependencyFilename = "dep-relative.json";
    const exportedFiles = exportDependenciesFromConfig(dependencyFilename, {
        force: false,
        cwd: SAMPLES_DIR
    });

    expect(exportedFiles.length).toEqual(2);
    for (const file of exportedFiles) {
        expect(existsSync(file)).toBeTruthy();
    }
    expect(parse(exportedFiles[0]).base).toMatch(
        CONFIG_FILENAME_START_WITH_REGEX
    );

    expectUniqueContractRecords(exportedFiles);
});

test("relative files' paths with one prefix", () => {
    const dependencyFilename = "dep-relative-prefixed.json";
    const config = DependencyConfig.detect({}, dependencyFilename, {
        cwd: SAMPLES_DIR
    });
    const exportedFiles = exportDependenciesFromConfig(dependencyFilename, {
        force: false,
        cwd: SAMPLES_DIR
    });

    expect(exportedFiles.length).toEqual(2);
    for (const file of exportedFiles) {
        expect(existsSync(file)).toBeTruthy();
    }

    expect(
        parse(exportedFiles[0]).base.startsWith(config.contracts[0].prefix)
    ).toBeTruthy();
    expect(parse(exportedFiles[0]).base).toMatch(
        CONFIG_FILENAME_CONTAINS_REGEX
    );
    expect(parse(exportedFiles[1]).base).toMatch(
        CONFIG_FILENAME_START_WITH_REGEX
    );

    expectUniqueContractRecords(exportedFiles);
});

test("relative files' paths with not existed files", () => {
    const dependencyFilename = "dep-relative-not-existed.json";
    const config = DependencyConfig.detect({}, dependencyFilename, {
        cwd: SAMPLES_DIR
    });
    const exportedFiles = exportDependenciesFromConfig(dependencyFilename, {
        force: false,
        cwd: SAMPLES_DIR
    });

    expect(exportedFiles.length).toEqual(1);
    for (const file of exportedFiles) {
        expect(existsSync(file)).toBeTruthy();
    }

    expect(parse(exportedFiles[0]).base).toMatch(
        CONFIG_FILENAME_START_WITH_REGEX
    );
});

test("relative files' paths with mixed prefixes", () => {
    const dependencyFilename = "dep-relative-mixed-prefixed.json";
    const config = DependencyConfig.detect({}, dependencyFilename, {
        cwd: SAMPLES_DIR
    });
    const exportedFiles = exportDependenciesFromConfig(dependencyFilename, {
        force: false,
        cwd: SAMPLES_DIR
    });

    expect(exportedFiles.length).toEqual(4);
    for (const file of exportedFiles) {
        expect(existsSync(file)).toBeTruthy();
    }

    const folderEntryIndex = 0;
    {
        const fileIdx = 0;
        expect(
            parse(exportedFiles[fileIdx]).base.startsWith(
                config.contracts[folderEntryIndex].prefix
            )
        ).toBeTruthy();
        expect(parse(exportedFiles[fileIdx]).base).toMatch(
            CONFIG_FILENAME_CONTAINS_REGEX
        );
    }
    {
        const fileIdx = 1;
        expect(
            parse(exportedFiles[fileIdx]).base.startsWith(
                config.contracts[folderEntryIndex].prefix
            )
        ).toBeTruthy();
        expect(parse(exportedFiles[fileIdx]).base).toMatch(
            CONFIG_FILENAME_CONTAINS_REGEX
        );
    }
    {
        const fileIdx = 2;
        expect(
            parse(exportedFiles[fileIdx]).base.startsWith(
                config.contracts[folderEntryIndex].prefix
            )
        ).toBeTruthy();
        expect(parse(exportedFiles[fileIdx]).base).toMatch(
            CONFIG_FILENAME_CONTAINS_REGEX
        );
    }

    const fileEntryIdx = 1;
    {
        const fileIdx = 3;
        expect(
            parse(exportedFiles[fileIdx]).base.startsWith(
                config.contracts[fileEntryIdx].prefix
            )
        ).toBeTruthy();
        expect(parse(exportedFiles[fileIdx]).base).toMatch(
            CONFIG_FILENAME_CONTAINS_REGEX
        );
    }

    expectUniqueContractRecords(exportedFiles);
});

test("relative files' paths with folder", () => {
    const dependencyFilename = "dep-relative-folder.json";
    const exportedFiles = exportDependenciesFromConfig(dependencyFilename, {
        force: false,
        cwd: SAMPLES_DIR
    });

    expect(exportedFiles.length).toEqual(3);
    for (const file of exportedFiles) {
        expect(existsSync(file)).toBeTruthy();
    }

    exportedFiles.forEach((file, index) => {
        expect(parse(file).base).toMatch(CONFIG_FILENAME_START_WITH_REGEX);
    });

    expectUniqueContractRecords(exportedFiles);
});

test("relative files' paths with prefixed folder", () => {
    const dependencyFilename = "dep-relative-folder-prefixed.json";
    const config = DependencyConfig.detect({}, dependencyFilename, {
        cwd: SAMPLES_DIR
    });
    const exportedFiles = exportDependenciesFromConfig(dependencyFilename, {
        force: false,
        cwd: SAMPLES_DIR
    });

    expect(exportedFiles.length).toEqual(3);
    for (const file of exportedFiles) {
        expect(existsSync(file)).toBeTruthy();
    }

    exportedFiles.forEach(file => {
        expect(
            parse(file).base.startsWith(config.contracts[0].prefix)
        ).toBeTruthy();
        expect(parse(file).base).toMatch(CONFIG_FILENAME_CONTAINS_REGEX);
    });

    expectUniqueContractRecords(exportedFiles);
});

test("relative files' paths with not existed folder", () => {
    const dependencyFilename = "dep-relative-folder-not-existed.json";
    const exportedFiles = exportDependenciesFromConfig(dependencyFilename, {
        force: false,
        cwd: SAMPLES_DIR
    });

    expect(exportedFiles.length).toEqual(0);
});

test("relative files' paths with prefixed folder", () => {
    const dependencyFilename = "dep-package.json";
    const exportedFiles = exportDependenciesFromConfig(dependencyFilename, {
        force: false,
        cwd: SAMPLES_DIR
    });

    expect(exportedFiles.length).toEqual(1);
    for (const file of exportedFiles) {
        expect(existsSync(file)).toBeTruthy();
    }
});

function expectUniqueContractRecords(files: string[]) {
    expect(unique(files).length).toEqual(files.length);
}
