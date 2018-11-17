import { PathLike } from "fs";
import * as Web3 from "web3";
import { TruffleArtifacts } from "truffle";
import * as TruffleDeployer from "truffle-deployer";
import { ArtifactRecord, saveDeployedArtifacts, getDeployedAddress, getUnwrappedDeployedAddress } from "@truffle-types/address-saver";
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
    readonly asyncWeb3: AsyncWeb3;

    public logger: Logger = console;
    public skipLogs = false;

    public constructor(
        public web3: Web3,
        public artifacts: TruffleArtifacts,
        public deployer: TruffleDeployer,
        public addressesPath: PathLike
    ) {
        this.asyncWeb3 = new AsyncWeb3(this.web3);
    }

    /**
     * Saves deployed addresses into storage
     * @param addresses list of addresses to save
     * @param networkId network identifier. Default: current network id
     */
    public async saveDeployedContractsAsync(addresses: ArtifactRecord[], networkId?: number): Promise<void> {
        if (!this.skipLogs) {
            for (const deployedContract of addresses) {
                this.logger.info(`${deployedContract.name} [${deployedContract.contract}] deployed at ${deployedContract.address}`)
            }
        }

        return saveDeployedArtifacts(networkId || await this.asyncWeb3.getNetworkId(), addresses, this.addressesPath);
    }

    /**
     * Reads deployed contract from storage
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    public async getDeployedContractAsync(name: string, networkId?: number): Promise<{address: string, contract: string } | undefined> {
        return getDeployedAddress(networkId || await this.asyncWeb3.getNetworkId(), name, this.addressesPath);
    }

    /**
     * Reads unwrapped deployed contract from storage
     * @throws Error when requested contract name wasn't found
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    public async getUnwrappedDeployedContractAsync(name: string, networkId?: number): Promise<{address: string, contract: string }> {
        return getUnwrappedDeployedAddress(networkId || await this.asyncWeb3.getNetworkId(), name, this.addressesPath);
    }

    public async getOrRedeployContractAsync<T extends Web3.ContractInstance>(name: string, contract: TruffleContract<T>, contractName: string, createContract: () => Promise<T>, options: { redeploy: boolean }, networkId?: number): Promise<T> {
        const deployedContractObj = await this.getDeployedContractAsync(name);

        if (deployedContractObj && !options.redeploy) {
            console.info(`Use already deployed contract '${name}' at ${deployedContractObj.address}`);
            return contract.at(deployedContractObj.address);
        }
        else {
            const contractInstance = await createContract();
            await this.saveDeployedContractsAsync([
                {
                    name,
                    address: contractInstance.address,
                    contract: (contract as any).contractName,
                }
            ]);
            return contractInstance;
        }
    }
}
