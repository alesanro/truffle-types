import * as _ from "lodash";
import { sync as globSync } from "glob";
import { readdirSync, writeFileSync } from "fs";
import { resolve, relative, basename, dirname } from "path";
import { sync as mkdirpSync } from "mkdirp";

export function generateArtifactExports(
    artifacts: string,
    destination: string,
    excludePatterns?: string[]
): void {
    const ARTIFACTS_FOLDER = resolve(artifacts);
    const artifactsFiles = readdirSync(ARTIFACTS_FOLDER, {
        encoding: "utf8",
        withFileTypes: false
    });
    let importPath = relative(dirname(destination), ARTIFACTS_FOLDER);
    /// NOTE: SC-24 Fix contracts path at artifact export under Windows
    if (process.platform.startsWith("win")) {
        importPath = importPath.split("\\").join("/");
    }

    let importsPart = "";
    let finalArtifactsFiles = artifactsFiles;

    // filter all files from excluded
    if (excludePatterns) {
        const excludedFiles = getExcludedFiles(
            ARTIFACTS_FOLDER,
            excludePatterns
        );
        console.info(
            `Artifacts will be excluded from exports: ${excludedFiles.join(
                ", "
            )}`
        );
        finalArtifactsFiles = artifactsFiles.filter(
            file =>
                excludedFiles.findIndex(otherFile => otherFile === file) === -1
        );
    }

    console.group(`Final artifacts to export:`);
    _.forEach(finalArtifactsFiles, file => console.info(`- ${file}`));
    console.groupEnd();

    // generate import statements
    for (const artifactFile of finalArtifactsFiles) {
        importsPart += `import * as ${basename(
            artifactFile,
            ".json"
        )} from "${importPath}/${artifactFile}";\n`;
    }

    // generate export statements
    const exportsPart = `export { ${finalArtifactsFiles
        .map(f => basename(f, ".json"))
        .join(", ")} };`;
    const fullFile = `${importsPart}\n${exportsPart}`;

    mkdirpSync(dirname(destination));
    writeFileSync(destination, fullFile, { encoding: "utf8" });
}

function getExcludedFiles(folder: string, patterns: string[]): string[] {
    const excludePatters = patterns || [];
    const excludedFiles = _.map(excludePatters, pattern => {
        console.info(`Perform search pattern to exclude: ${pattern}`);
        return globSync(pattern, { cwd: folder });
    });
    return _.flatten(excludedFiles);
}
