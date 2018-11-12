"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async_web3_1 = require("./async-web3");
class ContractDeployer {
    constructor(web3, artifacts, deployer) {
        this.web3 = web3;
        this.artifacts = artifacts;
        this.deployer = deployer;
        this.asyncWeb3 = new async_web3_1.AsyncWeb3(this.web3);
    }
}
exports.default = ContractDeployer;
