"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const artifact_saver_1 = require("../src/artifact-saver");
const chai_1 = require("chai");
const fs_1 = require("fs");
const util_1 = require("util");
const LOCAL_TEST_FILE_PATH = path_1.resolve("./");
const FILE_NAME = "test-artifacts.json";
describe("Deployed artifacts saver", () => {
    const ARTIFACTS_PATH = path_1.join(LOCAL_TEST_FILE_PATH, FILE_NAME);
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield util_1.promisify(fs_1.unlink)(ARTIFACTS_PATH);
    }));
    context("empty list", () => {
        it("should return empty object with no networks", () => __awaiter(this, void 0, void 0, function* () {
            const gotObject = yield artifact_saver_1.readDeployedArtifacts(ARTIFACTS_PATH);
            chai_1.assert.isEmpty(gotObject);
        }));
    });
    context("write", () => {
        it(`should allow to save single element`, () => __awaiter(this, void 0, void 0, function* () {
            const record = { name: "Random1", address: "0x123", contract: "Test" };
            yield artifact_saver_1.saveDeployedArtifacts(1, [record], ARTIFACTS_PATH);
            const gotObject = yield artifact_saver_1.readDeployedArtifacts(ARTIFACTS_PATH);
            chai_1.assert.isNotEmpty(gotObject, "Loaded artifacts should not be empty");
            const networkArtifacts = gotObject[1];
            chai_1.assert.isNotEmpty(networkArtifacts, "Aftifacts should not be empty");
            const artifactRecord = networkArtifacts[record.name];
            chai_1.assert.equal(artifactRecord.name, record.name);
            chai_1.assert.equal(artifactRecord.address, record.address);
            chai_1.assert.equal(artifactRecord.contract, record.contract);
        }));
        it("should allow to save more artifacts", () => __awaiter(this, void 0, void 0, function* () {
            const artifacts = {
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
            yield artifact_saver_1.saveDeployedArtifacts(1, artifacts[1], ARTIFACTS_PATH);
            yield artifact_saver_1.saveDeployedArtifacts(2, artifacts[2], ARTIFACTS_PATH);
            const gotObject = yield artifact_saver_1.readDeployedArtifacts(ARTIFACTS_PATH);
            chai_1.assert.isNotEmpty(gotObject);
            {
                const network = 1;
                const networkArtifacts = gotObject[network];
                const lastRecord = artifacts[network][artifacts[network].length - 1];
                const readRecord = networkArtifacts[lastRecord.name];
                chai_1.assert.isNotEmpty(readRecord);
                chai_1.assert.equal(readRecord.name, lastRecord.name);
                chai_1.assert.equal(readRecord.address, lastRecord.address);
                chai_1.assert.equal(readRecord.contract, lastRecord.contract);
                const firstRecord = artifacts[network][0];
                chai_1.assert.equal(readRecord.name, firstRecord.name);
                chai_1.assert.notEqual(readRecord.address, firstRecord.address);
                chai_1.assert.notEqual(readRecord.contract, firstRecord.contract);
                const foundRecord = yield artifact_saver_1.getDeployedAddress(network, lastRecord.name, ARTIFACTS_PATH);
                chai_1.assert.isDefined(foundRecord);
                if (foundRecord) {
                    chai_1.assert.equal(foundRecord.address, lastRecord.address);
                    chai_1.assert.equal(foundRecord.contract, lastRecord.contract);
                }
                else {
                    chai_1.assert(false, "Record should exist in filesystem");
                }
            }
            {
                const network = 2;
                const networkArtifacts = gotObject[network];
                const firstRecord = artifacts[network][0];
                const readRecord = networkArtifacts[firstRecord.name];
                chai_1.assert.equal(readRecord.name, firstRecord.name);
                chai_1.assert.equal(readRecord.address, firstRecord.address);
                chai_1.assert.equal(readRecord.contract, firstRecord.contract);
                const foundRecord = yield artifact_saver_1.getDeployedAddress(network, firstRecord.name, ARTIFACTS_PATH);
                chai_1.assert.isDefined(foundRecord);
                if (foundRecord) {
                    chai_1.assert.equal(foundRecord.address, firstRecord.address);
                    chai_1.assert.equal(foundRecord.contract, firstRecord.contract);
                }
                else {
                    chai_1.assert(false, "Record should exist in filesystem");
                }
            }
        }));
    });
});
