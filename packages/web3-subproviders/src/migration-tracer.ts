import { parse, join } from "path";
import { LoggerProvider, FileLoggerProvider, EmptyLoggerProvider } from "./logger-providers";
import { MigrationController } from "./migration-controller";
import { TransactionLogger } from "./tx-logger";
import { TransactionDestinationSubprovider, TransactionDestinationEvents, TxDestinationEventCallback } from "./subproviders/tx-to-subprovider";

const MIGRATIONS_SET_COMPELETED_SIG = "0xfdacd576";

export class MigrationSetupConfigurator {
    public txLogger = new TransactionLogger();
    public destinationSubprovider = new TransactionDestinationSubprovider();
    public currentLogProvider: LoggerProvider;
    public migrationsAddress: string | undefined;

    private _migrationCompletedStepListener: TxDestinationEventCallback = (toAddress, sig) => {
        if (!(this.migrationsAddress && toAddress === this.migrationsAddress && sig === MIGRATIONS_SET_COMPELETED_SIG)) {
            return;
        }

        this.currentLogProvider.invalidate();
        this.currentLogProvider = new EmptyLoggerProvider(this.txLogger);
    }

    constructor() {
        this.currentLogProvider = new EmptyLoggerProvider(this.txLogger);
    }

    setupMigrationHooks() {
        MigrationController.beforeMigrationStaticHook = (migrationFilePath, artifacts, deployer, network) => {
            this.destinationSubprovider.emitter.removeListener(TransactionDestinationEvents.TxDestination, this._migrationCompletedStepListener);

            const parsedPath = parse(migrationFilePath);
            
            this.currentLogProvider.invalidate();
            this.currentLogProvider = new FileLoggerProvider(join(parsedPath.dir, `${network}_txlogs`, `${parsedPath.name}.json`), this.txLogger);
        };

        MigrationController.afterMigrationStaticHook = (migrationFilePath, artifacts, deployer) => {
            const MigrationsContract = artifacts.require("Migrations");

            if (MigrationsContract.isDeployed()) {
                this.migrationsAddress = MigrationsContract.address;
                this.destinationSubprovider.emitter.on(TransactionDestinationEvents.TxDestination, this._migrationCompletedStepListener);
            }
        };
    }
}

