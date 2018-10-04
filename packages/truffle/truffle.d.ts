declare module 'truffle' {

  import { TxData as Tx, TransactionReceipt, ContractInstance } from 'web3';
  import { TruffleContract } from 'truffle-contract';

  namespace truffle {

    type AmountValue = string | number

    type ContractCallback = (
      this: Mocha.ISuiteCallbackContext,
      accounts: Address[]
    ) => void;

    type ContractContextDefinition = (
      description: string,
      callback: ContractCallback
    ) => Mocha.ISuite;

    interface TruffleArtifacts {
      require<A>(name: string): TruffleContract<A>
    }
  }

  module global {
    const contract: truffle.ContractContextDefinition
  }

  export = truffle;
}
