declare type Address = string;

declare module 'truffle-contract' {
	
	import Web3 from 'web3'
  
	namespace contract {
		
		type HexString = string

	  interface DeployedContract {
			address: Address,
			transactionHash: string,
			allEvents(value: Web3.BlockParamLiteral | Web3.EventFilterObject): Web3.FilterResult
		}

	  interface TruffleContract<A> {
			'new'(...args: any[]): Promise<A & DeployedContract> // No Enforcement
			at(address: Address): Promise<A & DeployedContract>
			deployed(): Promise<A & DeployedContract>
		
			defaults(params: Web3.CallData): void
			setProvider(provider: Web3.Provider): void
			setNetwork(networkId: string | number): void
			resetAddress(): void
		
			link<B>(instance: TruffleContract<B>): void
			link(name: string, address: Address): void
		
			hasNetwork(networkId: string | number): boolean
			isDeployed(): boolean
		
			abi: Web3.AbiDefinition[]
			bytecode: HexString
	  }
  
	  interface AnyTransactionEvent {
			event: string
			args: any
	  }
  
	  interface TransactionEvent<A> {
			event: string
			args: A
	  }
  
	  interface TransactionResult {
			tx: string
			logs: AnyTransactionEvent[]
			receipt: Web3.TransactionReceipt
    }
    
    type TransactionLog = {
      logIndex: number;
      transactionIndex: number;
      transactionHash: string;
      blockHash: string;
      blockNumber: number;
      address: Address;
      type: string;
      event: string;
      args: any;
    };

    interface Request {
      method: 'eth_call' | 'eth_sendTransaction';
      params: RequestParameter[];
    }

    interface RequestParameter {
      to: Address;
      data: string;
    }
	}
  
	function contract<A>(json: any): contract.TruffleContract<A>
	
	export = contract
}