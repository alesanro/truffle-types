import * as yargs from "yargs";
import { removeDeployedNetworkSync, removeDeployedNetworkExceptSync } from "../artifact-saver";

const args = yargs
    .option("addresses", {
        type: "string",
        demandOption: true,
        normalize: true,
        describe: "Path to artifacts deployed addresses"
    })
    .option("saveNetworks", {
        type: "array",
        demandOption: false,
        conflicts: ["network", "removeAll"],
        describe: "Leaves provided network ids unchanged, remove others"
    })
    .option("network", {
        type: "string",
        demandOption: false,
        conflicts: ["saveNetworks", "removeAll"],
        describe: "Network identifer in artifacts storage that should be removed"
    })
    .option("removeAll", {
        type: "boolean",
        demandOption: false,
        conflicts: ["network", "saveNetworks"]
    })
    .example("npx clean-addresses --addresses ./deployed-addresses.json --removeAll", "Removes all networks and leave file empty")
    .example("npx clean-addresses --addresses ./deployed-addresses.json --network=88", "Removes network 88 if such exists")
    .example("npx clean-addresses --addresses ./deployed-addresses.json --saveNetworks=88 99 4", "Leaves untouched 88, 99 and 4 networks, remove all others")
    .argv;

if (args.network) {
    removeDeployedNetworkSync(args.network, args.addresses);
    console.info(`Network ${args.network} was removed.`);
}
else if (args.saveNetworks && args.saveNetworks.length > 1) {
    removeDeployedNetworkExceptSync(args.saveNetworks, args.addresses);
    console.info(`All networks except ${args.saveNetworks} were removed.`);
}
else if (args.removeAll) {
    removeDeployedNetworkExceptSync([], args.addresses);
    console.info(`All networks were removed.`);
}
else {
    console.error(`Haven't found any legal options for cleaning networks. `);
}

process.exit(0);
