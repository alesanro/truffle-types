declare type Address = string;

declare module "truffle-contract" {
    import Web3 from "web3";

    export type HexString = string;

    export interface DeployedContract extends Web3.ContractInstance {
        address: Address;
        transactionHash: string;
        allEvents(value: Web3.BlockParamLiteral | Web3.EventFilterObject): Web3.FilterResult;
    }

    export interface TruffleContract<A> {
        "new"(...args: any[]): Promise<A & DeployedContract>; // No Enforcement
        at(address: Address): Promise<A & DeployedContract>;
        deployed(): Promise<A & DeployedContract>;

        defaults(params: Web3.CallData): void;
        setProvider(provider: Web3.Provider): void;
        setNetwork(networkId: string | number): void;
        resetAddress(): void;

        link<B>(instance: TruffleContract<B>): void;
        link(name: string, address: Address): void;

        hasNetwork(networkId: string | number): boolean;
        isDeployed(): boolean;
        address: string;

        contractName: string;
        abi: Web3.AbiDefinition[];
        bytecode: HexString;
    }

    export interface AnyTransactionEvent {
        event: string;
        args: any;
    }

    export interface TransactionEvent<A> {
        event: string;
        args: A;
    }

    export interface TransactionResult {
        tx: string;
        logs: AnyTransactionEvent[];
        receipt: Web3.TransactionReceipt;
    }

    export interface TransactionLog {
        logIndex: number;
        transactionIndex: number;
        transactionHash: string;
        blockHash: string;
        blockNumber: number;
        address: Address;
        type: string;
        event: string;
        args: any;
    }

    export interface Request {
        method: "eth_call" | "eth_sendTransaction";
        params: RequestParameter[];
    }

    export interface RequestParameter {
        to: Address;
        data: string;
    }

    export function contract<A>(json: any): TruffleContract<A>;
}
