const Migrations = artifacts.require("./Migrations")
const { MigrationController } = require("@truffle-types/migration-hooks")

module.exports = MigrationController.create().wrapTruffleMigration(__filename, artifacts, deployer => {
	deployer.then(async () => {
		await deployer.deploy(Migrations)
	})
})
