"use strict";

const Web3ProviderEngine = require("web3-provider-engine")
const RpcSubprovider = require("web3-provider-engine/subproviders/rpc")
const Web3 = require("web3")
const { TransactionSaverSubprovider } = require("@truffle-types/web3-subproviders")
const HDWalletProvider = require('truffle-hdwallet-provider')
const { MigrationSetupConfigurator } = require("../../lib/src/migration-tracer");

function getWallet(name) {
	try{
		return require('fs').readFileSync(`./${name}`, "utf8").trim();
	} catch(err){
		return "";
	}
}


const migrationConfigurator = new MigrationSetupConfigurator();
migrationConfigurator.setupMigrationHooks();

module.exports = {
	networks: {
		development: {
      provider: function () {
        const engine = new Web3ProviderEngine()
        const web3 = new Web3(engine)
        engine.addProvider(migrationConfigurator.destinationSubprovider)
        engine.addProvider(new TransactionSaverSubprovider(web3, migrationConfigurator.txLogger, { skipMultipleContractDeploys: true, }))
        engine.addProvider(new RpcSubprovider({ rpcUrl: "http://localhost:8545" }));
        engine.start()
        return engine
      },
			network_id: "*", // Match any network id
			gas: 4700000,
			gasPrice: 1,
    },
    kovan: {
      provider: (function () {
        const wallet = new HDWalletProvider(getWallet("wallet.json"),'QWEpoi123', 'https://kovan.infura.io/V7bcR20F3X5Kyg7GBH2M')
        const web3 = new Web3(wallet)
        const migrationSaverSubprovider = new TransactionSaverSubprovider(web3, migrationConfigurator.txLogger)

        wallet.engine._providers.unshift(migrationConfigurator.destinationSubprovider)
        wallet.engine._providers.unshift(migrationSaverSubprovider)
        migrationSaverSubprovider.setEngine(wallet.engine)

        return wallet
      }),
      network_id: 42,
      gas: 0x7A1200,
      gasPrice: 100000000
    },
    stage: {
      provider: (function () {
        const wallet = new HDWalletProvider(getWallet("wallet.1.json"), "test_pa$$", 'https://parity.tp.ntr1x.com:8545')
        const web3 = new Web3(wallet)
        const migrationSaverSubprovider = new TransactionSaverSubprovider(web3, migrationConfigurator.txLogger)

        wallet.engine._providers.unshift(migrationConfigurator.destinationSubprovider)
        wallet.engine._providers.unshift(migrationSaverSubprovider)
        migrationSaverSubprovider.setEngine(wallet.engine)

        return wallet
      })(),
      network_id: 88,
      gas: 0x7A1200,
      gasPrice: 0x01
    }
	},
	solc: {
		optimizer: {
			enabled: true,
			runs: 200,
		},
	},
	mocha: {
		useColors: true,
		timeout: 0,
	},
	migrations_directory: './migrations'
}
