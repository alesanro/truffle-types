export interface ArtifactRecord {
    name: string;
    address: string;
    contract: string;
}
export interface ArtifactsStorage {
    [networkId: number]: {
        [name: string]: ArtifactRecord;
    };
}
