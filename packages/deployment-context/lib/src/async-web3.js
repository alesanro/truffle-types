"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class AsyncWeb3 {
    constructor(web3) {
        this.web3 = web3;
        this.getEthBalance = (addr) => new Promise((resolve, reject) => {
            this.web3.eth.getBalance(addr, (e, b) => (e === undefined || e === null) ? resolve(b) : reject(e));
        });
        this.getTx = (hash) => new Promise((resolve, reject) => {
            this.web3.eth.getTransaction(hash, (e, tx) => (e === undefined || e === null) ? resolve(tx) : reject(e));
        });
        this.getTxReceipt = (hash) => new Promise((resolve, reject) => {
            this.web3.eth.getTransactionReceipt(hash, (e, tx) => (e === undefined || e === null) ? resolve(tx) : reject(e));
        });
        this.getTxExpences = (hash) => __awaiter(this, void 0, void 0, function* () {
            const fullTx = yield this.getTx(hash);
            const receiptTx = yield this.getTxReceipt(hash);
            return fullTx.gasPrice.mul(this.web3.toBigNumber(receiptTx.gasUsed));
        });
        this.sendEth = (from, to, value) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.web3.eth.sendTransaction({ from, to, value, }, (e, txHash) => (e === undefined || e === null) ? resolve(txHash) : reject(e));
            });
        });
        this.getNetworkId = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.web3.version.getNetwork((e, network) => (e === undefined || e === null) ? resolve(parseInt(network)) : reject(e));
            });
        });
    }
}
exports.AsyncWeb3 = AsyncWeb3;
