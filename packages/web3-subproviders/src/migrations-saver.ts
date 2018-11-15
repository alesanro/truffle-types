import { PathLike } from "fs";
// import { SubProvider } from "web3-provider-engine";

export default class MigrationsSaverSubprovider {
    constructor(readonly deployedAddressesPath: PathLike) {}
}