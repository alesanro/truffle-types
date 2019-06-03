import {
    ContractDeploymentReadonlyContext,
    ContractDeploymentContext
} from "./deployment-context";
// tslint:disable-next-line:no-implicit-dependencies
import * as Web3 from "web3";
// tslint:disable-next-line:no-implicit-dependencies
import { TruffleArtifacts } from "truffle";
// tslint:disable-next-line:no-implicit-dependencies
import { Deployer } from "truffle-deployer";
import { join, parse } from "path";
import { PathLike, copyFileSync, unlinkSync, existsSync } from "fs";

/** Provides context management */
export class DeploymentCoordinator {
    private _mainContext: ContractDeploymentContext;
    private _deprecationContext?: ContractDeploymentReadonlyContext;
    private _deprecationContextPath: PathLike;

    public constructor(
        public web3: Web3,
        public artifacts: TruffleArtifacts,
        public deployer: Deployer,
        public addressesPath: PathLike
    ) {
        this._mainContext = new ContractDeploymentContext(
            this.web3,
            this.artifacts,
            this.deployer,
            this.addressesPath
        );
        this._deprecationContextPath = this.addPostfixToFileName(
            addressesPath,
            "deprecation"
        );
    }

    /** Makes a copy of the main context
     * @param allowOverwrite if `true` then existed deprecation file (if exists) will be overwritten, skip otherwise
     */
    public snapshot(allowOverwrite = false): void {
        if (!allowOverwrite && existsSync(this._deprecationContextPath)) {
            if (this._deprecationContext === undefined) {
                console.dir(this._deprecationContext);
                this._deprecationContext = new ContractDeploymentReadonlyContext(
                    this.web3,
                    this.artifacts,
                    this.deployer,
                    this._deprecationContextPath
                );
            }
            return;
        }

        copyFileSync(this.addressesPath, this._deprecationContextPath);
        this._deprecationContext = new ContractDeploymentReadonlyContext(
            this.web3,
            this.artifacts,
            this.deployer,
            this._deprecationContextPath
        );
    }

    /** Removes a copy of the main context */
    public finalizeSnapshot(): void {
        if (existsSync(this._deprecationContextPath)) {
            unlinkSync(this._deprecationContextPath);
        }
    }

    public mainContext(): ContractDeploymentContext {
        return this._mainContext;
    }

    public deprecationContext(): ContractDeploymentReadonlyContext | undefined {
        return this._deprecationContext;
    }

    private addPostfixToFileName(path: PathLike, postfix: string): PathLike {
        const pathObj = parse(path.toString());
        return join(pathObj.dir, pathObj.name + "-" + postfix) + pathObj.ext;
    }
}
