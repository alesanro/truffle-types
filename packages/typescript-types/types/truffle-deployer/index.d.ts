declare module 'truffle-deployer' {

	import { TruffleContract, DeployedContract } from 'truffle-contract'

  namespace Deployer { }

  class Deployer {
    deploy<A>(contract: TruffleContract<A>, ...args: Array<any>): Promise<void>;
    link<A>(library: TruffleContract<A>, contracts: TruffleContract<any>[]): Promise<void>;
    network_id: string;
    then(callback: (...args: any[]) => any): Deployer;
    basePath: string;
  }

  export = Deployer
}
