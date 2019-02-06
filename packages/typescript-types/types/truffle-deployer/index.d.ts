declare module "truffle-deployer" {
    import { TruffleContract, DeployedContract } from "truffle-contract";

    export class Deployer {
        deploy<A>(contract: TruffleContract<A>, ...args: any[]): Promise<void>;
        link<A>(library: TruffleContract<A>, contracts: TruffleContract<any>[]): Promise<void>;
        network_id: string;
        then(callback: (...args: any[]) => any): Deployer;
        basePath: string;
    }
}
