/// <reference types="@machinomy/types-web3" />
/// <reference types="@truffle-types/web3" />
/// <reference types="@truffle-types/truffle" />
/// <reference types="@truffle-types/truffle-deployer" />
import * as Web3 from "web3";
import { TruffleArtifacts } from "truffle";
import * as TruffleDeployer from "truffle-deployer";
import { ArtifactRecord } from "@truffle-types/address-saver";
import { AsyncWeb3 } from "./async-web3";
/**
 * Provides setup for deploy context.
 * Includes web3 and allows to load/save deployed contracts
 */
export default class ContractDeploymentContext {
    web3: Web3;
    artifacts: TruffleArtifacts;
    deployer: TruffleDeployer;
    addressesPath: string;
    readonly asyncWeb3: AsyncWeb3;
    constructor(web3: Web3, artifacts: TruffleArtifacts, deployer: TruffleDeployer, addressesPath: string);
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
}
