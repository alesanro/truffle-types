declare module "ganache-core" {
    import { Server } from "http";
    import { EventEmitter } from "events";

    export type Hex = string;

    export interface AccountOptions {
        secretKey?: string;
        balance?: number | string;
    }

    export interface Logger {
        log(message?: any, ...optionalParams: any[]): void;
    }

    export interface GanacheOptions {
        accounts?: AccountOptions[];
        debug?: boolean;
        logger?: Logger;
        mnemonic?: string;
        port?: number;
        seed?: string;
        default_balance_ether?: number | string;
        total_accounts?: number;
        fork?: string | object;
        fork_block_number?: number | string;
        network_id?: number;
        time?: Date;
        locked?: boolean;
        unlocked_accounts?: string[] | number[];
        db_path?: string;
        db?: object;
        ws?: boolean;
        vmErrorsOnRPCResponse?: boolean;
        hdPath?: string;
        allowUnlimitedContractSize?: boolean;
        gasPrice?: Hex;
        gasLimit?: Hex;
    }

    export type ProviderCallback = (error: any, response: any) => void;

    export interface Provider {
        send(payload: any, callback: ProviderCallback): void;
        close(callback: ProviderCallback): void;
    }

    export interface Account {
        secretKey: Hex;
        publicKey: Hex;
        address: string;
        account: AccountInternals;
    }

    export interface AccountInternals {
        balance: Hex;
    }

    export interface Snapshot {
        blockNumber: number;
        timeAdjustment: number;
    }

    export interface StateManager {
        options: GanacheOptions;
        accounts: Account[];
        blockTime: string;
        wallet_hdpath: string;
        snapshots: Snapshot[];
        net_version: number;
        mnemonic: string;
        gasPriceVal: string;
    }

    export function server(options?: GanacheOptions): Server;
    export function provider(options?: GanacheOptions): Provider & EventEmitter;
}
