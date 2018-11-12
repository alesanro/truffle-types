import * as Web3 from "web3";
import { TruffleArtifacts } from "truffle";
import * as TruffleDeployer from "truffle-deployer";
import { AsyncWeb3 } from "./async-web3";

export default class ContractDeploymentContext {
    readonly asyncWeb3: AsyncWeb3;

    public constructor(
        public web3: Web3,
        public artifacts: TruffleArtifacts,
        public deployer: TruffleDeployer,
        public addressesPath: string
    ) {
        this.asyncWeb3 = new AsyncWeb3(this.web3);
    }
}
