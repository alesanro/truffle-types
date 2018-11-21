export interface ContractAbi {
	contractName: string;
	abi: any[];
	bytecode: string;
	deployedBytecode: string;
	compiler: any;
	networks: any;
	schemaVersion: string;
	updatedAt: string;
}
