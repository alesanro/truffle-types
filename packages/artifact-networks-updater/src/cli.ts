import * as yargs from "yargs";
import { moveAndWriteNetworkForArtifactsDir, moveAndWriteNetworkForSingleArtifactFile  } from "./";

const args = yargs
.option("sourceFile", {
    type: "string",
    normalize: true,
    demandOption: false
})
.option("targetFile", {
    type: "string",
    normalize: true,
    demandOption: false
})
.option("sourceDir", {
    type: "string",
    normalize: true,
    demandOption: false
})
.option("targetDir", {
    type: "string",
    normalize: true,
    demandOption: false
})
.option("exclude", {
    type: "string",
    demandOption: false,
    description: "Allows to exclude some files from updating",
})
.example("artifact-networks-updater --sourceFile=./build/contracts/UtilsLib.json --targetFile=../otherProject/build/contracts/UtilsLib.json", "Provide source and target abi files to move networks from deployed artifact to newly compiled one")
.example("artifact-networks-updater --sourceDir=./build/contracts --targetDir=../otherProject/build/contracts", "Provide source and target directories with abis to move networks from deployed artifacts to newly compiled")
.argv;

if (args.sourceFile && args.targetFile) {
    moveAndWriteNetworkForSingleArtifactFile(args.sourceFile, args.targetFile);
}
else if (args.sourceDir && args.targetDir) {
    moveAndWriteNetworkForArtifactsDir(args.sourceDir, args.targetDir, args.exclude);
}
else {
    throw new Error(`It is required to provide pairs of either source and target files or source and target directories to make it work. No other options allowed.`);
}
