/// <reference types="types-web3" />
import Web3 from "web3";
import { BigNumber } from "bignumber.js";
export declare class AsyncWeb3 {
    private web3;
    constructor(web3: Web3);
    getEthBalance: (addr: string) => Promise<BigNumber>;
    getTx: (hash: string) => Promise<Web3.Transaction>;
    getTxReceipt: (hash: string) => Promise<Web3.TransactionReceipt>;
    getTxExpences: (hash: string) => Promise<BigNumber>;
    sendEth: (from: string, to: string, value: BigNumber) => Promise<string>;
    getNetworkId: () => Promise<number>;
}
