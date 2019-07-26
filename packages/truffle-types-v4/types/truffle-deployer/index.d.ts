declare module "truffle-deployer" {
    import { TruffleContract, DeployedContract } from "truffle-contract";

    export class Deployer {
        constructor(options: {
            provider: any;
            network: string;
            network_id: string;
            logger?: any;
            basePath?: string;
            contracts?: any;
        });
        deploy<A>(contract: TruffleContract<A>, ...args: any[]): Promise<void>;
        link<A>(
            library: TruffleContract<A>,
            contracts: TruffleContract<any>[]
        ): Promise<void>;
        // tslint:disable-next-line:variable-name
        network_id: string;
        start(): Promise<void>;
        then(callback: (...args: any[]) => any): Deployer;
        basePath: string;
        logger: any;
        // tslint:disable-next-line:variable-name
        known_contracts: any;
        network: string;
        provider: any;
        chain: any;
    }
}
