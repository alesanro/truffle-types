// tslint:disable-next-line:no-implicit-dependencies
import Deployer from "truffle-deployer";
import { TruffleArtifacts } from "truffle";

type MigrationFunc = (deployer: Deployer, network?: string, accounts?: string[]) => void;
type FullMigrationFunc = (deployer: Deployer, network: string, accounts: string[]) => void;
type HookFunc = (migrationPath: string, artifacts: TruffleArtifacts, deployer: Deployer, network: string, accounts: string[]) => void;

export class MigrationController {

    public static active = true;

    static beforeMigrationStaticHook: HookFunc = () => {};
    static afterMigrationStaticHook: HookFunc = () => {};

    static create() {
        return new MigrationController();
    }

    private _skip = false;

    private _beforeMigrationInstanceHook: HookFunc = () => {};
    private _afterMigrationInstanceHook: HookFunc = () => {};

    skip(): MigrationController {
        this._skip = true;
        return this;
    }

    setBeforeMigrationInstanceHook(hook: HookFunc): MigrationController {
        this._beforeMigrationInstanceHook = hook;
        return this;
    }

    setAfterMigrationInstanceHook(hook: HookFunc): MigrationController {
        this._afterMigrationInstanceHook = hook;
        return this;
    }

    wrapTruffleMigration(targetFilePath: string, artifacts: TruffleArtifacts, migration: MigrationFunc): FullMigrationFunc {
        if (!MigrationController.active || this._skip) {
            return migration;
        }

        return (deployer, network, accounts) => {
            // --- before hooks
            if (MigrationController.beforeMigrationStaticHook) {
                MigrationController.beforeMigrationStaticHook(targetFilePath, artifacts, deployer, network, accounts);
            }

            if (this._beforeMigrationInstanceHook) {
                this._beforeMigrationInstanceHook(targetFilePath, artifacts, deployer, network, accounts);
            }

            // --- main migration
            deployer.then(async () => {
                console.log(`[MigrationsController] ${targetFilePath} before migration`);
            });

            migration(deployer, network, accounts);

            deployer.then(async () => {
                console.log(`[MigrationsController] ${targetFilePath} after migration`);
            });

            // --- after hooks
            if (this._afterMigrationInstanceHook) {
                this._afterMigrationInstanceHook(targetFilePath, artifacts, deployer, network, accounts);
            }

            if (MigrationController.afterMigrationStaticHook) {
                MigrationController.afterMigrationStaticHook(targetFilePath, artifacts, deployer, network, accounts);
            }
        };
    }
}
