import { writeFile, readFile, existsSync, readFileSync, PathLike, writeFileSync } from "fs";
import { promisify } from "util";

import { ArtifactRecord, ArtifactsStorage } from "./types";

/**
 * Saves provided artifacts in the file and associate them with networkId ASYNCHRONOUSLY
 * @param networkId network identifier
 * @param artifacts records to be saved
 * @param path saving destination path
 */
export async function saveDeployedArtifacts(networkId: number, artifacts: ArtifactRecord[], path: PathLike): Promise<void> {
    const deployedArtifacts = await readDeployedArtifacts(path);
    const mergedArtifacts = _mergeArtifactsWithIncomingRecords(networkId, deployedArtifacts, artifacts);
    return promisify(writeFile)(path, JSON.stringify(mergedArtifacts, undefined, "\t"), { encoding: "utf8" });
}

/**
 * Saves provided artifacts in the file and associate them with networkId SYNCHRONOUSLY
 * @param networkId network identifier
 * @param artifacts records to be saved
 * @param path saving destination path
 */
export function saveDeployedArtifactsSync(networkId: number, artifacts: ArtifactRecord[], path: PathLike): void {
    const deployedArtifacts = readDeployedArtifactsSync(path);
    const mergedArtifacts = _mergeArtifactsWithIncomingRecords(networkId, deployedArtifacts, artifacts);
    return writeFileSync(path, JSON.stringify(mergedArtifacts, undefined, "\t"), { encoding: "utf8" });
}

function _mergeArtifactsWithIncomingRecords(networkId: number, deployedArtifacts: ArtifactsStorage, incomingArtifacts: ArtifactRecord[]): ArtifactsStorage {
    const transformedArtifacts: {[name: string]: ArtifactRecord} = incomingArtifacts.reduce((prev, current) => ({
        ...prev,
        [current.name]: current,
    }), {});

    const mergedArtifactRecords = {
        ...(deployedArtifacts[networkId]),
        ...transformedArtifacts,
    };

    const mergedArtifacts = {
        ...deployedArtifacts,
        [networkId]: mergedArtifactRecords,
    };

    return mergedArtifacts;
}

/**
 * Loads artifacts from provided path ASYNCHRONOUSLY
 * @param path target path with saved artifacts
 * @returns promise with fully loaded addresses storage object
 */
export async function readDeployedArtifacts(path: PathLike): Promise<ArtifactsStorage> {
    if (!existsSync(path)) {
        return {};
    }

    return JSON.parse(<any>(await promisify(readFile)(path, { encoding: "utf8" })));
}

/**
 * Loads artifacts from provided path SYNCHRONOUSLY
 * @param path target path with saved artifacts
 * @returns fully loaded addresses storage object
 */
export function readDeployedArtifactsSync(path: PathLike): ArtifactsStorage {
    if (!existsSync(path)) {
        return {};
    }

    return JSON.parse(<any>(readFileSync(path, { encoding: "utf8" })));
}

/**
 * Gets single address for provided network and contract alias ASYNCHRONOUSLY
 * @param network network identifier
 * @param name address alias that is was saved before with
 * @param path target path to saved artifacts
 * @returns promise of pair of address and contract name; undefined if no record was found in this network
 */
export async function getDeployedAddress(network: number, name: string, path: PathLike): Promise<{address: string, contract: string }|undefined> {
    const deployedArtifacts = await readDeployedArtifacts(path);
    const deployedArtifact = deployedArtifacts[network];
    return deployedArtifact[name];
}

/**
 * Gets single address for provided network and contract alias SYNCHRONOUSLY
 * @param network network identifier
 * @param name address alias that is was saved before with
 * @param path target path to saved artifacts
 * @returns promise with the pair of address and contract name; undefined if no record was found in this network
 */
export function getDeployedAddressSync(network: number, name: string, path: PathLike): {address: string, contract: string } | undefined {
    const deployedArtifacts = readDeployedArtifactsSync(path);
    const deployedArtifact = deployedArtifacts[network];
    return deployedArtifact[name];
}

/**
 * Gets single address for provided network and contract alias ASYNCHRONOUSLY
 * @throws Error when no address with provided alias was found for networkId
 * @param network network identifier
 * @param name alias for deployed contract
 * @param path target path to saved artifacts
 * @returns pair of address and contract name
 */
export async function getUnwrappedDeployedAddress(network: number, name: string, path: PathLike): Promise<{
    address: string;
    contract: string;
}> {
    const readObj = await getDeployedAddress(network, name, path);
    if (!readObj) {
        throw new Error(`Address of '${name}' is not deployed or saved properly for network '${network}'`);
    }

    return readObj;
}

/**
 * Gets single address for provided network and contract alias SYNCHRONOUSLY
 * @throws Error when no address with provided alias was found for networkId
 * @param network network identifier
 * @param name alias for deployed contract
 * @param path target path to saved artifacts
 * @returns pair of address and contract name
 */
export function getUnwrappedDeployedAddressSync(network: number, name: string, path: PathLike): { address: string, contract: string, } {
    const readObj = getDeployedAddressSync(network, name, path);
    if (!readObj) {
        throw new Error(`Address of '${name}' is not deployed or saved properly for network '${network}'`);
    }

    return readObj;
}

/**
 * Removes full network record from addresses storage ASYNCHRONOUSLY.
 * Mostly for clean work.
 * @param network network identifier
 * @param path target path to saved artifacts
 * @returns Promise
 */
export async function removeDeployedNetwork(network: number, path: PathLike): Promise<void> {
    const deployedArtifacts = await readDeployedArtifacts(path);

    if (deployedArtifacts[network]) {
        delete deployedArtifacts[network];
        promisify(writeFile)(path, JSON.stringify(deployedArtifacts, undefined, "\t"));
    }
}

/**
 * Removes full network record from addresses storage SYNCHRONOUSLY.
 * Mostly for clean work.
 * @param network network identifier
 * @param path target path to saved artifacts
 */
export function removeDeployedNetworkSync(network: number, path: PathLike): void {
    const deployedArtifacts = readDeployedArtifactsSync(path);

    if (deployedArtifacts[network]) {
        delete deployedArtifacts[network];
        writeFileSync(path, JSON.stringify(deployedArtifacts, undefined, "\t"));
    }
}

/**
 * Removes all network except provided ones ASYNCHRONOUSLY.
 * @param networks list of network identifiers that should stay in addresses storage
 * @param path target path to saved artifacts
 */
export async function removeDeployedNetworkExcept(networks: number[], path: PathLike): Promise<void> {
    const deployedArtifacts = await readDeployedArtifacts(path);

    for (const networkKey in deployedArtifacts) {
        const networkNotProvided = networks.findIndex(value => parseInt(networkKey) === value) === -1;

        if (deployedArtifacts.hasOwnProperty(networkKey) && networkNotProvided) {
            delete deployedArtifacts[networkKey];
        }
    }

    promisify(writeFile)(path, JSON.stringify(deployedArtifacts, undefined, "\t"));
}

/**
 * Removes all network except provided ones SYNCHRONOUSLY.
 * @param networks list of network identifiers that should stay in addresses storage
 * @param path target path to saved artifacts
 */
export function removeDeployedNetworkExceptSync(networks: number[], path: PathLike): void {
    const deployedArtifacts = readDeployedArtifactsSync(path);

    for (const networkKey in deployedArtifacts) {
        const networkNotProvided = networks.findIndex(value => parseInt(networkKey) === value) === -1;

        if (deployedArtifacts.hasOwnProperty(networkKey) && networkNotProvided) {
            delete deployedArtifacts[networkKey];
        }
    }

    writeFileSync(path, JSON.stringify(deployedArtifacts, undefined, "\t"));
}
