import { PathLike } from "fs";
// tslint:disable-next-line:no-implicit-dependencies
import Web3 from "web3";
// tslint:disable-next-line:no-implicit-dependencies
import { TruffleArtifacts } from "truffle";
// tslint:disable-next-line:no-implicit-dependencies
import { Deployer as TruffleDeployer } from "truffle-deployer";
import {
    ArtifactRecord,
    saveDeployedArtifacts,
    getDeployedAddress,
    getUnwrappedDeployedAddress
} from "@truffle-types/address-saver";
import { AsyncWeb3 } from "./async-web3";
// tslint:disable-next-line:no-implicit-dependencies
import { TruffleContract } from "truffle-contract";

interface Logger {
    info(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    group(...label: any[]): void;
    groupEnd(): void;
}

export interface ContractDeploymentContextState {
    logger: Logger;
    skipLogs: boolean;

    web3: Web3;
    artifacts: TruffleArtifacts;
    deployer: TruffleDeployer;
    addressesPath: PathLike;
}

/**
 * Defines readonly interface for deployment contexts so not saving operations or deploying a contract.
 */
export interface ContractDeploymentContextReadInterface
    extends ContractDeploymentContextState {
    /**
     * Reads deployed contract from storage
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    getDeployedContractAsync(
        name: string,
        networkId?: number
    ): Promise<{ address: string; contract: string } | undefined>;

    /**
     * Reads deployed contract from storage; after look up creates an instance of truffle contract
     * @param contract truffle contract to be instantiated
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    getUnwrappedContractInstanceAsync<T>(
        contract: TruffleContract<T>,
        name: string,
        networkId?: number
    ): Promise<T>;

    /**
     * Reads unwrapped deployed contract from storage
     * @throws Error when requested contract name wasn't found
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    getUnwrappedDeployedContractAsync(
        name: string,
        networkId?: number
    ): Promise<{ address: string; contract: string }>;

    /**
     * Reads unwrapped deployed contract from storage by primary alias and if no address will be found
     *  then one more attempt will be made with backupName alias
     * @param name alias of deployed contract
     * @param backupName backup alias if no address will be found for primary alias
     * @param networkId network identifier. Default: current network id
     */
    getUnwrappedDeployedContractOrBackupAsync(
        name: string | undefined,
        backupName: string,
        networkId?: number
    ): Promise<{ address: string; contract: string }>;
}

/**
 * Defines write interface for deployment contexts that allows to save/deploy new contracts
 */
export interface ContractDeploymentContextWriteInterface
    extends ContractDeploymentContextState {
    /**
     * Saves deployed addresses into storage
     * @param addresses list of addresses to save
     * @param networkId network identifier. Default: current network id
     */
    saveDeployedContractsAsync(
        addresses: ArtifactRecord[],
        networkId?: number
    ): Promise<void>;

    /**
     * Reads deployed contract from storage. If no contract yet found (deployed) then provided closure will be executed
     *  and returned truffle contract instance will be saved with provided alias.
     *  Additional option could be provided:
     *  - redeploy: execute closure even if contract with provided alias is already deployed
     * @param name alias of deployed contract
     * @param contract truffle contract
     * @param createContract closure with truffle contract deployment
     * @param options additional options
     * @param networkId network identifier. Default: current network id
     */
    getOrRedeployContractAsync<T extends Web3.ContractInstance>(
        name: string,
        contract: TruffleContract<T>,
        createContract: () => Promise<T>,
        options: { redeploy: boolean },
        networkId?: number
    ): Promise<T>;
}

/**
 * Provides setup for deploy context.
 * Includes web3 and allows to load deployed contracts
 */
export class ContractDeploymentReadonlyContext
    implements ContractDeploymentContextReadInterface {
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
     * Reads deployed contract from storage
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    public async getDeployedContractAsync(
        name: string,
        networkId?: number
    ): Promise<{ address: string; contract: string } | undefined> {
        return getDeployedAddress(
            networkId || (await this.asyncWeb3.getNetworkId()),
            name,
            this.addressesPath
        );
    }

    /**
     * Reads deployed contract from storage; after look up it creates an instance of truffle contract
     * @param contract truffle contract to be instantiated
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    public async getUnwrappedContractInstanceAsync<T>(
        contract: TruffleContract<T>,
        name: string,
        networkId?: number
    ): Promise<T> {
        const contractObj = await this.getUnwrappedDeployedContractAsync(
            name,
            networkId
        );

        if (contract.contractName !== contractObj.contract) {
            this.logger.warn(
                `[deployment-context] Possibly wrong contract passed for address ${
                    contractObj.address
                }. Got ${contract.contractName}, expected ${
                    contractObj.contract
                }`
            );
        }

        return contract.at(contractObj.address);
    }

    /**
     * Reads unwrapped deployed contract from storage
     * @throws Error when requested contract name wasn't found
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    public async getUnwrappedDeployedContractAsync(
        name: string,
        networkId?: number
    ): Promise<{ address: string; contract: string }> {
        return getUnwrappedDeployedAddress(
            networkId || (await this.asyncWeb3.getNetworkId()),
            name,
            this.addressesPath
        );
    }

    /**
     * Reads unwrapped deployed contract from storage by primary alias and if no address will be found
     *  then one more attempt will be made with backupName alias
     * @param name alias of deployed contract
     * @param backupName backup alias if no address will be found for primary alias
     * @param networkId network identifier. Default: current network id
     */
    public async getUnwrappedDeployedContractOrBackupAsync(
        name: string | undefined,
        backupName: string,
        networkId?: number
    ): Promise<{ address: string; contract: string }> {
        if (name) {
            return this.getUnwrappedDeployedContractAsync(name, networkId);
        } else {
            this.logger.info(
                `[DeploymentContext] Cannot define first order key, backup to key '${backupName}'`
            );
            return this.getUnwrappedDeployedContractAsync(
                backupName,
                networkId
            );
        }
    }
}

/**
 * Provides setup for deploy context.
 * Includes web3 and allows to load/save deployed contracts
 */
export class ContractDeploymentContext extends ContractDeploymentReadonlyContext
    implements ContractDeploymentContextWriteInterface {
    public constructor(
        web3: Web3,
        artifacts: TruffleArtifacts,
        deployer: TruffleDeployer,
        addressesPath: PathLike
    ) {
        super(web3, artifacts, deployer, addressesPath);
    }

    /**
     * Saves deployed addresses into storage
     * @param addresses list of addresses to save
     * @param networkId network identifier. Default: current network id
     */
    public async saveDeployedContractsAsync(
        addresses: ArtifactRecord[],
        networkId?: number
    ): Promise<void> {
        if (!this.skipLogs) {
            for (const deployedContract of addresses) {
                this.logger.info(
                    `${deployedContract.name} [${
                        deployedContract.contract
                    }] deployed at ${deployedContract.address}`
                );
            }
        }

        return saveDeployedArtifacts(
            networkId || (await this.asyncWeb3.getNetworkId()),
            addresses,
            this.addressesPath
        );
    }

    /**
     * Reads deployed contract from storage. If no contract yet found (deployed) then provided closure will be executed
     *  and returned truffle contract instance will be saved with provided alias.
     *  Additional option could be provided:
     *  - redeploy: execute closure even if contract with provided alias is already deployed
     * @param name alias of deployed contract
     * @param contract truffle contract
     * @param createContract closure with truffle contract deployment
     * @param options additional options
     * @param networkId network identifier. Default: current network id
     */
    public async getOrRedeployContractAsync<T extends Web3.ContractInstance>(
        name: string,
        contract: TruffleContract<T>,
        createContract: () => Promise<T>,
        options: { redeploy: boolean },
        networkId?: number
    ): Promise<T> {
        const deployedContractObj = await this.getDeployedContractAsync(
            name,
            networkId
        );

        if (deployedContractObj && !options.redeploy) {
            this.logger.info(
                `Use already deployed contract '${name}' at ${
                    deployedContractObj.address
                }`
            );
            return contract.at(deployedContractObj.address);
        } else {
            const contractInstance = await createContract();
            await this.saveDeployedContractsAsync(
                [
                    {
                        name,
                        address: contractInstance.address,
                        contract: contract.contractName
                    }
                ],
                networkId
            );
            return contractInstance;
        }
    }
}
