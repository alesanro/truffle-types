/// <reference types="@machinomy/types-web3" />
/// <reference types="@truffle-types/web3" />
/// <reference types="@truffle-types/truffle" />
/// <reference types="@truffle-types/truffle-deployer" />
import * as Web3 from "web3";
import { TruffleArtifacts } from "truffle";
import * as TruffleDeployer from "truffle-deployer";
import { AsyncWeb3 } from "./async-web3";
export default class ContractDeploymentContext {
    web3: Web3;
    artifacts: TruffleArtifacts;
    deployer: TruffleDeployer;
    addressesPath?: string | undefined;
    readonly asyncWeb3: AsyncWeb3;
    constructor(web3: Web3, artifacts: TruffleArtifacts, deployer: TruffleDeployer, addressesPath?: string | undefined);
}
