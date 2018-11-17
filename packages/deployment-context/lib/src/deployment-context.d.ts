/// <reference types="types-web3" />
/// <reference types="node" />
import { PathLike } from "fs";
import * as Web3 from "web3";
import { TruffleArtifacts } from "truffle";
import * as TruffleDeployer from "truffle-deployer";
import { ArtifactRecord } from "@truffle-types/address-saver";
import { AsyncWeb3 } from "./async-web3";
import { TruffleContract } from "truffle-contract";
interface Logger {
    info(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
}
/**
 * Provides setup for deploy context.
 * Includes web3 and allows to load/save deployed contracts
 */
export default class ContractDeploymentContext {
    web3: Web3;
    artifacts: TruffleArtifacts;
    deployer: TruffleDeployer;
    addressesPath: PathLike;
    readonly asyncWeb3: AsyncWeb3;
    logger: Logger;
    skipLogs: boolean;
    constructor(web3: Web3, artifacts: TruffleArtifacts, deployer: TruffleDeployer, addressesPath: PathLike);
    /**
     * Saves deployed addresses into storage
     * @param addresses list of addresses to save
     * @param networkId network identifier. Default: current network id
     */
    saveDeployedContractsAsync(addresses: ArtifactRecord[], networkId?: number): Promise<void>;
    /**
     * Reads deployed contract from storage
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    getDeployedContractAsync(name: string, networkId?: number): Promise<{
        address: string;
        contract: string;
    } | undefined>;
    /**
     * Reads unwrapped deployed contract from storage
     * @throws Error when requested contract name wasn't found
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    getUnwrappedDeployedContractAsync(name: string, networkId?: number): Promise<{
        address: string;
        contract: string;
    }>;
    getOrRedeployContractAsync<T extends Web3.ContractInstance>(name: string, contract: TruffleContract<T>, contractName: string, createContract: () => Promise<T>, options: {
        redeploy: boolean;
    }, networkId?: number): Promise<T>;
}
export {};
