const Web3ProviderEngine = require("web3-provider-engine")
const RpcSubprovider = require("web3-provider-engine/subproviders/rpc")
const Web3 = require("web3")
const { TransactionSaverSubprovider, TransactionLogFileLoader, TransactionLogger } = require("../../lib/src")
const HDWalletProvider = require('truffle-hdwallet-provider')

function getWallet(name){
	try{
		return require('fs').readFileSync(`./${name}`, "utf8").trim();
	} catch(err){
		return "";
	}
}

let txLogger = new TransactionLogger();
let logLoader = new TransactionLogFileLoader("./txlogs.json", txLogger);


module.exports = {
	networks: {
		development: {
      provider: function () {
        const engine = new Web3ProviderEngine()
        const web3 = new Web3(engine)
        engine.addProvider(new TransactionSaverSubprovider("./deployed-addresses.json", web3, logLoader.txLogger))
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
        const migrationSaverSubprovider = new TransactionSaverSubprovider("./deployed-addresses.json", web3, logLoader.txLogger)

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
        const migrationSaverSubprovider = new TransactionSaverSubprovider("./deployed-addresses.json", web3, logLoader.txLogger)

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
