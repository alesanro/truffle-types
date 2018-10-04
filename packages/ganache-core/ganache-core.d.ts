declare module 'ganache-core' {

	import { Server } from "http"
	import { EventEmitter } from "events"

	namespace Ganache {

		type Hex = string

		interface Account {
			secretKey?: string
			balance?: number | string
		}

		interface Logger {
			log(message?: any, ...optionalParams: any[]): void;
		}

		interface GanacheOptions {
			accounts?: Account[]
			debug?: boolean
			logger?: Logger
			mnemonic?: string
			port?: number
			seed?: Hex
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

		interface Ganache {
			server(options?: GanacheOptions): Server
			provider(options?: GanacheOptions): Provider & EventEmitter
		}
	}

	export = Ganache
}
