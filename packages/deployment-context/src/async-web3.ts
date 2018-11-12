// tslint:disable-next-line:no-implicit-dependencies
import Web3, { TransactionReceipt, Transaction } from "web3";
import { BigNumber } from "bignumber.js";

export class AsyncWeb3 {

    constructor(private web3: Web3) {}

    getEthBalance = (addr: string) => new Promise<BigNumber>((resolve, reject) => {
        this.web3.eth.getBalance(addr, (e, b) => (e === undefined || e === null) ? resolve(b) : reject(e));
    })

    getTx = (hash: string) => new Promise<Transaction>((resolve, reject) => {
        this.web3.eth.getTransaction(hash, (e, tx) => (e === undefined || e === null) ? resolve(tx) : reject(e));
    })

    getTxReceipt = (hash: string) => new Promise<TransactionReceipt>((resolve, reject) => {
        this.web3.eth.getTransactionReceipt(hash, (e, tx) => (e === undefined || e === null) ? resolve(tx) : reject(e));
    })

    getTxExpences = async (hash: string): Promise<BigNumber> => {
        const fullTx = await this.getTx(hash);
        const receiptTx = await this.getTxReceipt(hash);

        return fullTx.gasPrice.mul(this.web3.toBigNumber(receiptTx.gasUsed));
    }

    sendEth = async (from: string, to: string, value: BigNumber) => {
        return new Promise<string>((resolve, reject) => {
            this.web3.eth.sendTransaction({ from, to, value, }, (e, txHash) => (e === undefined || e === null) ? resolve(txHash) : reject(e));
        });
    }

    getNetworkId = async () => {
        return new Promise<number>((resolve, reject) => {
            this.web3.version.getNetwork((e, network) => (e === undefined || e === null) ? resolve(parseInt(network)) : reject(e));
        });
    }
}
