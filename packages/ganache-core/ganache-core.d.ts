declare module 'ganache-core' {

	import { Server } from "http"
	import { EventEmitter } from "events"

	namespace Ganache {

		type Hex = string

		interface AccountOpt {
			secretKey?: string
			balance?: number | string
		}

		interface Logger {
			log(message?: any, ...optionalParams: any[]): void;
		}

		interface GanacheOptions {
			accounts?: AccountOpt[]
			debug?: boolean
			logger?: Logger
			mnemonic?: string
			port?: number
			seed?: Hex
			default_balance_ether?: number | string
			total_accounts?: number
			fork?: string | Object
			fork_block_number?: number | string
			network_id?: number
			time?: Date
			locked?: boolean
			unlocked_accounts?: string[] | number[]
			db_path?: string
			db?: Object
			ws?: boolean
			vmErrorsOnRPCResponse?: boolean
			hdPath?: string
			allowUnlimitedContractSize?: boolean
			gasPrice?: Hex
			gasLimit?: Hex
		}

		type ProviderCallback = (error: Object, response: Object) => void

		interface Provider {
			send(payload: Object, callback: ProviderCallback): void
			close(callback: ProviderCallback): void
		}

		interface Ganache {
			server(options?: GanacheOptions): Server
			provider(options?: GanacheOptions): Provider & EventEmitter
		}
	}

	export = Ganache
}
