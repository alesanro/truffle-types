import { resolve, join } from "path";
import { readDeployedArtifacts, saveDeployedArtifacts, getDeployedAddress } from "../src/artifact-saver";
import { ArtifactRecord,  } from "../src/types";

import { assert } from "chai";
import { unlink } from "fs";
import { promisify } from "util";

const LOCAL_TEST_FILE_PATH = resolve("./");

const FILE_NAME = "test-artifacts.json";

describe("Deployed artifacts saver", () => {

    const ARTIFACTS_PATH = join(LOCAL_TEST_FILE_PATH, FILE_NAME);

    after(async () => {
        await promisify(unlink)(ARTIFACTS_PATH);
    });

    context("empty list", () => {
        it("should return empty object with no networks", async () => {
            const gotObject = await readDeployedArtifacts(ARTIFACTS_PATH);
            assert.isEmpty(gotObject);
        });
    });

    context("write", () => {

        it(`should allow to save single element`, async () => {
            const record: ArtifactRecord = {name: "Random1", address: "0x123", contract: "Test"};
            await saveDeployedArtifacts(1, [record], ARTIFACTS_PATH);
            const gotObject = await readDeployedArtifacts(ARTIFACTS_PATH);
            assert.isNotEmpty(gotObject, "Loaded artifacts should not be empty");

            const networkArtifacts = gotObject[1];
            assert.isNotEmpty(networkArtifacts, "Aftifacts should not be empty");

            const artifactRecord = networkArtifacts[record.name];
            assert.equal(artifactRecord.name, record.name);
            assert.equal(artifactRecord.address, record.address);
            assert.equal(artifactRecord.contract, record.contract);
        });

        it("should allow to save more artifacts", async () => {
            const artifacts: { [network: number]: ArtifactRecord[]} = {
                [1]: [
                    {
                        name: "mone",
                        address: "0x111",
                        contract: "test",
                    }, {
                        name: "mone",
                        address: "0x112",
                        contract: "test3",
                    }
                ],
                [2]: [
                    {
                        name: "mone",
                        address: "0x111",
                        contract: "test",
                    }
                ]
            };

            await saveDeployedArtifacts(1, artifacts[1], ARTIFACTS_PATH);
            await saveDeployedArtifacts(2, artifacts[2], ARTIFACTS_PATH);

            const gotObject = await readDeployedArtifacts(ARTIFACTS_PATH);
            assert.isNotEmpty(gotObject);

            {
                const network = 1;
                const networkArtifacts = gotObject[network];
                const lastRecord = artifacts[network][artifacts[network].length - 1];
                const readRecord = networkArtifacts[lastRecord.name];
                assert.isNotEmpty(readRecord);
                assert.equal(readRecord.name, lastRecord.name);
                assert.equal(readRecord.address, lastRecord.address);
                assert.equal(readRecord.contract, lastRecord.contract);

                const firstRecord = artifacts[network][0];
                assert.equal(readRecord.name, firstRecord.name);
                assert.notEqual(readRecord.address, firstRecord.address);
                assert.notEqual(readRecord.contract, firstRecord.contract);

                const foundRecord = await getDeployedAddress(network, lastRecord.name, ARTIFACTS_PATH);
                assert.isDefined(foundRecord);
                if (foundRecord) {
                    assert.equal(foundRecord.address, lastRecord.address);
                    assert.equal(foundRecord.contract, lastRecord.contract);
                } else {
                    assert(false, "Record should exist in filesystem");
                }
            }
            {
                const network = 2;
                const networkArtifacts = gotObject[network];
                const firstRecord = artifacts[network][0];
                const readRecord = networkArtifacts[firstRecord.name];
                assert.equal(readRecord.name, firstRecord.name);
                assert.equal(readRecord.address, firstRecord.address);
                assert.equal(readRecord.contract, firstRecord.contract);

                const foundRecord = await getDeployedAddress(network, firstRecord.name, ARTIFACTS_PATH);
                assert.isDefined(foundRecord);
                if (foundRecord) {
                    assert.equal(foundRecord.address, firstRecord.address);
                    assert.equal(foundRecord.contract, firstRecord.contract);
                } else {
                    assert(false, "Record should exist in filesystem");
                }
            }
        });
    });
});
