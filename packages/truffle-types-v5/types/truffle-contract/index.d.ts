declare module "truffle-contract" {
    import { Provider } from "web3/providers";
    import { ABIDefinition } from "web3/eth/abi";
    import { TransactionReceipt } from "web3/types";
    import { CallData } from "web3-types";

    type HexString = string;
    type Address = string;

    export interface DeployedContract {
        address: Address;
        abi: ABIDefinition[];
        transactionHash: string;
        [name: string]: any;
    }

    export interface TruffleContract<A> {
        "new"(...args: any[]): Promise<A>;
        at(address: string): Promise<A>;
        deployed(): Promise<A>;

        defaults(params: CallData): void;
        setProvider(provider: Provider): void;
        setNetwork(networkId: string | number): void;
        resetAddress(): void;

        link<B>(instance: TruffleContract<B>): void;
        link(name: string, address: string): void;
        link(libs: LibsMap): void;

        hasNetwork(networkId: string | number): boolean;
        isDeployed(): boolean;

        clone<B>(networkId: string | number): TruffleContract<B>;

        networks: NetworksMap;
        network: Network;
        timeoutBlocks: number;
        numberFormat: NumberFormat;
        autoGas: boolean;
        gasMultiplier: number;

        address: string;
        contractName: string;
        abi: ABIDefinition[];
        bytecode: HexString;
    }

    type NumberFormat = "BigNumber" | "BN" | "String";

    interface LibsMap {
        [name: string]: Address;
    }

    interface NetworksMap {
        [networkId: string]: Network;
        [networkId: number]: Network;
    }

    interface Network {
        events: any;
        links: any;
        address?: string;
        transactionHash?: string;
    }

    export interface TransactionResult {
        tx: string;
        logs: AnyTransactionEvent[];
        receipt: TransactionReceipt;
    }

    export interface AnyTransactionEvent {
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
