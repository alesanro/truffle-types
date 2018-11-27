export interface ContractAbi {
    contractName: string;
    abi: any[];
    bytecode: string;
    deployedBytecode: string;
    compiler: any;
    networks: { [networkId: string]: ContractNetwork };
    schemaVersion: string;
    updatedAt: string;
}

export interface ContractNetwork {
    events: { [eventSelectorHash: string]: ContractEvent };
    links: { [contractName: string]: string };
    address: string;
    transactionHash: string;
}

export interface ContractEvent {
    anonymous: boolean;
    inputs: ContractInput[];
    name: string;
    type: string;
}

export interface ContractInput {
    indexed: boolean;
    name: string;
    type: string;
}
