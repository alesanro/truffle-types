// tslint:disable-next-line:no-implicit-dependencies
import * as yargs from "yargs";
import { getModulePathSync } from ".";

const args = yargs.option("package", {
    type: "string",
    normalize: true,
    demandOption: true,
}).argv;

const modulePath = getModulePathSync(args.package);
process.stdout.write(modulePath);
