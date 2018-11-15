/// <reference types="@types/node" />
import { PathLike } from "fs";
export default class MigrationsSaverSubprovider {
    readonly deployedAddressesPath: PathLike;
    constructor(deployedAddressesPath: PathLike);
}
