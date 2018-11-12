declare module 'truffle-deployer' {

	import { TruffleContract, DeployedContract } from 'truffle-contract'
  
  namespace Deployer { }

  class Deployer {
    deploy<A>(contract: TruffleContract<A>, ...args: Array<any>): Promise<void>
    link<A, B>(library: TruffleContract<A>, contract: TruffleContract<B>): Promise<void>
    link<A>(library: TruffleContract<A>, ...args: TruffleContract<any>[]): Promise<void>
    network_id: string
  }

  export = Deployer
}