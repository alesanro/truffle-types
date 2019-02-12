import { DeploymentCoordinator } from "../src/deployment-coordinator";
// tslint:disable-next-line:no-implicit-dependencies
import chai, { expect } from "chai";
import { PathLike, unlinkSync } from "fs";
import { join } from "path";
// tslint:disable-next-line:no-implicit-dependencies
import pkgDir from "pkg-dir";
// tslint:disable-next-line:no-implicit-dependencies
import Chaifs = require("chai-fs");

chai.use(Chaifs);

describe("Deployment coordinator", () => {
    let deploymentCoordinator: DeploymentCoordinator;
    const addresses = [
        {
            name: "Test1Lib",
            address: "0x6c08d9843ce8cec1a9de4e051887927b62f7cec0",
            contract: "Test1",
        },
        {
            name: "Test2Lib",
            address: "0xb6fd91d56dddac4139f3f0f13ba6e6d6e67d0dae",
            contract: "Test2",
        },
        {
            name: "Test3",
            address: "0x8d5ed64ba5366ba14851965d0447fedcd382fbbe",
            contract: "Test3",
        },
        {
            name: "Test4",
            address: "0xf4f02a0689950921dfb8eb54533b96300c887f3a",
            contract: "Test4",
        },
    ];
    const networkId = 123125;
    let path: PathLike;

    before(async () => {
        // tslint:disable-next-line:prefer-const
        let web3: any;
        // tslint:disable-next-line:prefer-const
        let artifacts: any;
        // tslint:disable-next-line:prefer-const
        let deployer: any;

        const rootDir = pkgDir.sync(__dirname);
        if (!rootDir) throw new Error(`Cannot find root dir in ${rootDir}`);
        path = join(rootDir, "deployed-contracts.json");

        deploymentCoordinator = new DeploymentCoordinator(web3, artifacts, deployer, path);
    });
    after(async () => {
        unlinkSync(path);
    });

    it("should save contract info to file with pointed path", async () => {
        await deploymentCoordinator.mainContext().saveDeployedContractsAsync(addresses, networkId);
        const path = deploymentCoordinator.mainContext().addressesPath;

        // tslint:disable-next-line:no-unused-expression
        expect(path).to.be.a.file().with.json;
    });

    it("should make copy of deployed contracts file with pointed path", () => {
        deploymentCoordinator.snapshot();
        const path = deploymentCoordinator.deprecationContext()!.addressesPath;

        // tslint:disable-next-line:no-unused-expression
        expect(path).to.be.a.file().with.json;
    });

    it("should rewrite file", () => {
        deploymentCoordinator.snapshot();
        deploymentCoordinator.snapshot();
        const path = deploymentCoordinator.deprecationContext()!.addressesPath;

        // tslint:disable-next-line:no-unused-expression
        expect(path).to.be.a.file().with.json;
    });

    it("should remove deprecation deployed contracts file with pointed path", () => {
        deploymentCoordinator.finalizeSnapshot();
        const path = deploymentCoordinator.deprecationContext()!.addressesPath;

        expect(path).to.not.be.a.path();
    });

    it("should have right behavior, if file is not exists", () => {
        deploymentCoordinator.finalizeSnapshot();
        deploymentCoordinator.finalizeSnapshot();
        const path = deploymentCoordinator.deprecationContext()!.addressesPath;

        expect(path).to.not.be.a.path();
    });
});
