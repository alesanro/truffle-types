import { resolve } from "path";
// tslint:disable-next-line:no-implicit-dependencies
import * as yargs from "yargs";
import { getInstalledPathSync } from "get-installed-path";

const args = yargs
.option("package", {
    type: "string",
    normalize: true,
    demandOption: true,
}).argv;

console.log(getInstalledPathSync(args.package, { paths: [ resolve("./node_modules"), resolve("../node_modules"), resolve("../../node_modules") ] }));
