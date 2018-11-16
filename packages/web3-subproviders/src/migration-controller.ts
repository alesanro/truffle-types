import Deployer from "truffle-deployer";

type MigrationFunc = (deployer: Deployer, network?: string, accounts?: string[]) => void;

export class MigrationController {
    static wrapTruffleMigration(migration: MigrationFunc): MigrationFunc {
        return (deployer, network, accounts) => {

            const migrationPath = deployer.basePath;
            deployer.then(async () => {
                console.log(`[MigrationsController] ${migrationPath} before migration`);
            });

            migration(deployer, network, accounts);

            deployer.then(async () => {
                console.log(`[MigrationsController] ${migrationPath} after migration`);
            });
        };
    }
}
