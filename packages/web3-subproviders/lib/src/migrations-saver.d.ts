/// <reference types="@types/node" />
/// <reference types="@machinomy/types-web3" />
/// <reference types="@truffle-types/web3" />
import { PathLike } from "fs";
import SubProvider from "web3-provider-engine/subproviders/subprovider";
import { JSONRPCRequestPayload } from "ethereum-protocol";
import * as Web3 from "web3";
export declare class MigrationsSaverSubprovider extends SubProvider {
    readonly deployedAddressesPath: PathLike;
    web3: Web3;
    constructor(deployedAddressesPath: PathLike, web3: Web3);
    handleRequest(payload: JSONRPCRequestPayload, next: SubProvider.NextFunctionCallback, end: SubProvider.EndFunctionCallback): void;
}
