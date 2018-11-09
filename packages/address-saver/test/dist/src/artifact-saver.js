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
const fs_1 = require("fs");
const util_1 = require("util");
/**
 * Saves provided artifacts in the file and associate them with networkId ASYNCHRONOUSLY
 * @param networkId network identifier
 * @param artifacts records to be saved
 * @param path saving destination path
 */
function saveDeployedArtifacts(networkId, artifacts, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const deployedArtifacts = yield readDeployedArtifacts(path);
        const mergedArtifacts = _mergeArtifactsWithIncomingRecords(networkId, deployedArtifacts, artifacts);
        return util_1.promisify(fs_1.writeFile)(path, JSON.stringify(mergedArtifacts, undefined, "\t"), { encoding: "utf8" });
    });
}
exports.saveDeployedArtifacts = saveDeployedArtifacts;
/**
 * Saves provided artifacts in the file and associate them with networkId SYNCHRONOUSLY
 * @param networkId network identifier
 * @param artifacts records to be saved
 * @param path saving destination path
 */
function saveDeployedArtifactsSync(networkId, artifacts, path) {
    const deployedArtifacts = readDeployedArtifactsSync(path);
    const mergedArtifacts = _mergeArtifactsWithIncomingRecords(networkId, deployedArtifacts, artifacts);
    return fs_1.writeFileSync(path, JSON.stringify(mergedArtifacts, undefined, "\t"), { encoding: "utf8" });
}
exports.saveDeployedArtifactsSync = saveDeployedArtifactsSync;
function _mergeArtifactsWithIncomingRecords(networkId, deployedArtifacts, incomingArtifacts) {
    const transformedArtifacts = incomingArtifacts.reduce((prev, current) => (Object.assign({}, prev, { [current.name]: current })), {});
    const mergedArtifactRecords = Object.assign({}, (deployedArtifacts[networkId]), transformedArtifacts);
    const mergedArtifacts = Object.assign({}, deployedArtifacts, { [networkId]: mergedArtifactRecords });
    return mergedArtifacts;
}
/**
 * Loads artifacts from provided path ASYNCHRONOUSLY
 * @param path target path with saved artifacts
 * @returns promise with fully loaded addresses storage object
 */
function readDeployedArtifacts(path) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.existsSync(path)) {
            return {};
        }
        return JSON.parse((yield util_1.promisify(fs_1.readFile)(path, { encoding: "utf8" })));
    });
}
exports.readDeployedArtifacts = readDeployedArtifacts;
/**
 * Loads artifacts from provided path SYNCHRONOUSLY
 * @param path target path with saved artifacts
 * @returns fully loaded addresses storage object
 */
function readDeployedArtifactsSync(path) {
    if (!fs_1.existsSync(path)) {
        return {};
    }
    return JSON.parse((fs_1.readFileSync(path, { encoding: "utf8" })));
}
exports.readDeployedArtifactsSync = readDeployedArtifactsSync;
/**
 * Gets single address for provided network and contract alias ASYNCHRONOUSLY
 * @param network network identifier
 * @param name address alias that is was saved before with
 * @param path target path to saved artifacts
 * @returns promise of pair of address and contract name; undefined if no record was found in this network
 */
function getDeployedAddress(network, name, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const deployedArtifacts = yield readDeployedArtifacts(path);
        const deployedArtifact = deployedArtifacts[network];
        return deployedArtifact[name];
    });
}
exports.getDeployedAddress = getDeployedAddress;
/**
 * Gets single address for provided network and contract alias SYNCHRONOUSLY
 * @param network network identifier
 * @param name address alias that is was saved before with
 * @param path target path to saved artifacts
 * @returns promise with the pair of address and contract name; undefined if no record was found in this network
 */
function getDeployedAddressSync(network, name, path) {
    const deployedArtifacts = readDeployedArtifactsSync(path);
    const deployedArtifact = deployedArtifacts[network];
    return deployedArtifact[name];
}
exports.getDeployedAddressSync = getDeployedAddressSync;
/**
 * Gets single address for provided network and contract alias ASYNCHRONOUSLY
 * @throws Error when no address with provided alias was found for networkId
 * @param network network identifier
 * @param name alias for deployed contract
 * @param path target path to saved artifacts
 * @returns pair of address and contract name
 */
function getUnwrappedDeployedAddress(network, name, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const readObj = yield getDeployedAddress(network, name, path);
        if (!readObj) {
            throw new Error(`Address of '${name}' is not deployed or saved properly for network '${network}'`);
        }
        return readObj;
    });
}
exports.getUnwrappedDeployedAddress = getUnwrappedDeployedAddress;
/**
 * Gets single address for provided network and contract alias SYNCHRONOUSLY
 * @throws Error when no address with provided alias was found for networkId
 * @param network network identifier
 * @param name alias for deployed contract
 * @param path target path to saved artifacts
 * @returns pair of address and contract name
 */
function getUnwrappedDeployedAddressSync(network, name, path) {
    const readObj = getDeployedAddressSync(network, name, path);
    if (!readObj) {
        throw new Error(`Address of '${name}' is not deployed or saved properly for network '${network}'`);
    }
    return readObj;
}
exports.getUnwrappedDeployedAddressSync = getUnwrappedDeployedAddressSync;
/**
 * Removes full network record from addresses storage ASYNCHRONOUSLY.
 * Mostly for clean work.
 * @param network network identifier
 * @param path target path to saved artifacts
 * @returns Promise
 */
function removeDeployedNetwork(network, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const deployedArtifacts = yield readDeployedArtifacts(path);
        if (deployedArtifacts[network]) {
            delete deployedArtifacts[network];
            util_1.promisify(fs_1.writeFile)(path, JSON.stringify(deployedArtifacts, undefined, "\t"));
        }
    });
}
exports.removeDeployedNetwork = removeDeployedNetwork;
/**
 * Removes full network record from addresses storage SYNCHRONOUSLY.
 * Mostly for clean work.
 * @param network network identifier
 * @param path target path to saved artifacts
 */
function removeDeployedNetworkSync(network, path) {
    const deployedArtifacts = readDeployedArtifactsSync(path);
    if (deployedArtifacts[network]) {
        delete deployedArtifacts[network];
        fs_1.writeFileSync(path, JSON.stringify(deployedArtifacts, undefined, "\t"));
    }
}
exports.removeDeployedNetworkSync = removeDeployedNetworkSync;
