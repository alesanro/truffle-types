declare module "truffle" {
    import Web3, { TxData as Tx, TransactionReceipt, ContractInstance } from "web3";
    import { TruffleContract } from "truffle-contract";
    import { Deployer } from "truffle-deployer";

    export type AmountValue = string | number;

    export type ContractCallback = (this: Mocha.ISuiteCallbackContext, accounts: Address[]) => void;

    export type ContractContextDefinition = (description: string, callback: ContractCallback) => Mocha.ISuite;

    export type Migration = (deploy: Deployer, network: string, accounts: Address[]) => void;

    export interface TruffleArtifacts {
        require<A>(name: string): TruffleContract<A>;
    }

    module global {
        const web3: Web3;
        const artifacts: TruffleArtifacts;
        const contract: ContractContextDefinition;
    }
}
