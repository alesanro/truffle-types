// tslint:disable-next-line:no-implicit-dependencies
import { Deployer } from "truffle-deployer";
// tslint:disable-next-line:no-implicit-dependencies
import { TruffleArtifacts } from "truffle";
// tslint:disable-next-line:no-implicit-dependencies
import Web3 from "web3";

type MigrationFunc = (
    deployer: Deployer,
    network?: string,
    accounts?: string[]
) => void;
type FullMigrationFunc = (
    deployer: Deployer,
    network: string,
    accounts: string[]
) => void;
type HookFunc = (
    migrationPath: string,
    web3: Web3,
    artifacts: TruffleArtifacts,
    deployer: Deployer,
    network: string,
    accounts: string[]
) => void;

/**
 * Defines controller object that allows to organize migration hooks: local and global one.
 */
export class MigrationController {
    public static active = true;

    // tslint:disable-next-line:no-empty
    static beforeMigrationStaticHook: HookFunc = () => {};
    // tslint:disable-next-line:no-empty
    static afterMigrationStaticHook: HookFunc = () => {};

    static create() {
        return new MigrationController();
    }

    private _skip = false;

    // tslint:disable-next-line:no-empty
    private _beforeMigrationInstanceHook: HookFunc = () => {};
    // tslint:disable-next-line:no-empty
    private _afterMigrationInstanceHook: HookFunc = () => {};

    /**
     * Skips all steps for current migration
     */
    skip(): MigrationController {
        this._skip = true;
        return this;
    }

    /**
     * Sets migration hook function that will be performed before migration
     * @param hook function that will be performed before actual migration
     */
    setBeforeMigrationInstanceHook(hook: HookFunc): MigrationController {
        this._beforeMigrationInstanceHook = hook;
        return this;
    }

    /**
     * Sets migration hook function that will be performed after migration is finished
     * @param hook function that will be performed after actual migration
     */
    setAfterMigrationInstanceHook(hook: HookFunc): MigrationController {
        this._afterMigrationInstanceHook = hook;
        return this;
    }

    /**
     * Wraps truffle migration into custom function and allows to apply migration hooks
     * @param targetFilePath migration filepath
     * @param artifacts truffle artifacts module
     * @param migration actual migration function
     */
    wrapTruffleMigration(
        targetFilePath: string,
        web3: Web3,
        artifacts: TruffleArtifacts,
        migration: MigrationFunc
    ): FullMigrationFunc {
        if (!MigrationController.active || this._skip) {
            return migration;
        }

        return (deployer, network, accounts) => {
            // --- before hooks
            if (MigrationController.beforeMigrationStaticHook) {
                MigrationController.beforeMigrationStaticHook(
                    targetFilePath,
                    web3,
                    artifacts,
                    deployer,
                    network,
                    accounts
                );
            }

            if (this._beforeMigrationInstanceHook) {
                this._beforeMigrationInstanceHook(
                    targetFilePath,
                    web3,
                    artifacts,
                    deployer,
                    network,
                    accounts
                );
            }

            // --- main migration
            deployer.then(async () => {
                console.log(
                    `[MigrationsController] ${targetFilePath} before migration`
                );
            });

            migration(deployer, network, accounts);

            deployer.then(async () => {
                console.log(
                    `[MigrationsController] ${targetFilePath} after migration`
                );
            });

            // --- after hooks
            if (this._afterMigrationInstanceHook) {
                this._afterMigrationInstanceHook(
                    targetFilePath,
                    web3,
                    artifacts,
                    deployer,
                    network,
                    accounts
                );
            }

            if (MigrationController.afterMigrationStaticHook) {
                MigrationController.afterMigrationStaticHook(
                    targetFilePath,
                    web3,
                    artifacts,
                    deployer,
                    network,
                    accounts
                );
            }
        };
    }
}
