"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const address_saver_1 = require("@truffle-types/address-saver");
const async_web3_1 = require("./async-web3");
/**
 * Provides setup for deploy context.
 * Includes web3 and allows to load/save deployed contracts
 */
class ContractDeploymentContext {
    constructor(web3, artifacts, deployer, addressesPath) {
        this.web3 = web3;
        this.artifacts = artifacts;
        this.deployer = deployer;
        this.addressesPath = addressesPath;
        this.logger = console;
        this.skipLogs = false;
        this.asyncWeb3 = new async_web3_1.AsyncWeb3(this.web3);
    }
    /**
     * Saves deployed addresses into storage
     * @param addresses list of addresses to save
     * @param networkId network identifier. Default: current network id
     */
    saveDeployedContractsAsync(addresses, networkId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.skipLogs) {
                for (const deployedContract of addresses) {
                    this.logger.info(`${deployedContract.name} [${deployedContract.contract}] deployed at ${deployedContract.address}`);
                }
            }
            return address_saver_1.saveDeployedArtifacts(networkId || (yield this.asyncWeb3.getNetworkId()), addresses, this.addressesPath);
        });
    }
    /**
     * Reads deployed contract from storage
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    getDeployedContractAsync(name, networkId) {
        return __awaiter(this, void 0, void 0, function* () {
            return address_saver_1.getDeployedAddress(networkId || (yield this.asyncWeb3.getNetworkId()), name, this.addressesPath);
        });
    }
    /**
     * Reads unwrapped deployed contract from storage
     * @throws Error when requested contract name wasn't found
     * @param name alias of deployed contract
     * @param networkId network identifier. Default: current network id
     */
    getUnwrappedDeployedContractAsync(name, networkId) {
        return __awaiter(this, void 0, void 0, function* () {
            return address_saver_1.getUnwrappedDeployedAddress(networkId || (yield this.asyncWeb3.getNetworkId()), name, this.addressesPath);
        });
    }
}
exports.default = ContractDeploymentContext;
