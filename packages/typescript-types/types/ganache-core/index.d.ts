declare module 'ganache-core' {

	import { Server } from "http"
	import { EventEmitter } from "events"

	namespace Ganache {

		type Hex = string

		interface AccountOptions {
			secretKey?: string
			balance?: number | string
		}

		interface Logger {
			log(message?: any, ...optionalParams: any[]): void;
		}

		interface GanacheOptions {
			accounts?: AccountOptions[]
			debug?: boolean
			logger?: Logger
			mnemonic?: string
			port?: number
			seed?: string
			default_balance_ether?: number | string
			total_accounts?: number
			fork?: string | object
			fork_block_number?: number | string
			network_id?: number
			time?: Date
			locked?: boolean
			unlocked_accounts?: string[] | number[]
			db_path?: string
			db?: object
			ws?: boolean
			vmErrorsOnRPCResponse?: boolean
			hdPath?: string
			allowUnlimitedContractSize?: boolean
			gasPrice?: Hex
			gasLimit?: Hex
		}

		type ProviderCallback = (error: any, response: any) => void

		interface Provider {
			send(payload: any, callback: ProviderCallback): void
			close(callback: ProviderCallback): void
		}


		interface Account {
			secretKey: Hex
			publicKey: Hex
			address: string
			account: AccountInternals
		}

		interface AccountInternals {
			balance: Hex
		}

		interface Snapshot {
			blockNumber: number
			timeAdjustment: number
		}

		interface StateManager {
			options: GanacheOptions
			accounts: Account[]
			blockTime: string
			wallet_hdpath: string
			snapshots: Snapshot[]
			net_version: number
			mnemonic: string
			gasPriceVal: string
		}

		function server(options?: GanacheOptions): Server
		function provider(options?: GanacheOptions): Provider & EventEmitter
	}

	export = Ganache
}
