/// <reference types="node" />
import { PathLike } from "fs";
import { ArtifactRecord, ArtifactsStorage } from "./types";
/**
 * Saves provided artifacts in the file and associate them with networkId ASYNCHRONOUSLY
 * @param networkId network identifier
 * @param artifacts records to be saved
 * @param path saving destination path
 */
export declare function saveDeployedArtifacts(networkId: number, artifacts: ArtifactRecord[], path: PathLike): Promise<void>;
/**
 * Saves provided artifacts in the file and associate them with networkId SYNCHRONOUSLY
 * @param networkId network identifier
 * @param artifacts records to be saved
 * @param path saving destination path
 */
export declare function saveDeployedArtifactsSync(networkId: number, artifacts: ArtifactRecord[], path: PathLike): void;
/**
 * Loads artifacts from provided path ASYNCHRONOUSLY
 * @param path target path with saved artifacts
 * @returns promise with fully loaded addresses storage object
 */
export declare function readDeployedArtifacts(path: PathLike): Promise<ArtifactsStorage>;
/**
 * Loads artifacts from provided path SYNCHRONOUSLY
 * @param path target path with saved artifacts
 * @returns fully loaded addresses storage object
 */
export declare function readDeployedArtifactsSync(path: PathLike): ArtifactsStorage;
/**
 * Gets single address for provided network and contract alias ASYNCHRONOUSLY
 * @param network network identifier
 * @param name address alias that is was saved before with
 * @param path target path to saved artifacts
 * @returns promise of pair of address and contract name; undefined if no record was found in this network
 */
export declare function getDeployedAddress(network: number, name: string, path: PathLike): Promise<{
    address: string;
    contract: string;
} | undefined>;
/**
 * Gets single address for provided network and contract alias SYNCHRONOUSLY
 * @param network network identifier
 * @param name address alias that is was saved before with
 * @param path target path to saved artifacts
 * @returns promise with the pair of address and contract name; undefined if no record was found in this network
 */
export declare function getDeployedAddressSync(network: number, name: string, path: PathLike): {
    address: string;
    contract: string;
} | undefined;
/**
 * Gets single address for provided network and contract alias ASYNCHRONOUSLY
 * @throws Error when no address with provided alias was found for networkId
 * @param network network identifier
 * @param name alias for deployed contract
 * @param path target path to saved artifacts
 * @returns pair of address and contract name
 */
export declare function getUnwrappedDeployedAddress(network: number, name: string, path: PathLike): Promise<{
    address: string;
    contract: string;
}>;
/**
 * Gets single address for provided network and contract alias SYNCHRONOUSLY
 * @throws Error when no address with provided alias was found for networkId
 * @param network network identifier
 * @param name alias for deployed contract
 * @param path target path to saved artifacts
 * @returns pair of address and contract name
 */
export declare function getUnwrappedDeployedAddressSync(network: number, name: string, path: PathLike): {
    address: string;
    contract: string;
};
/**
 * Removes full network record from addresses storage ASYNCHRONOUSLY.
 * Mostly for clean work.
 * @param network network identifier
 * @param path target path to saved artifacts
 * @returns Promise
 */
export declare function removeDeployedNetwork(network: number, path: PathLike): Promise<void>;
/**
 * Removes full network record from addresses storage SYNCHRONOUSLY.
 * Mostly for clean work.
 * @param network network identifier
 * @param path target path to saved artifacts
 */
export declare function removeDeployedNetworkSync(network: number, path: PathLike): void;
