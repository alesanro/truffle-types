export interface ArtifactRecord {
    name: string;
    address: string;
    contract: string;
}

export interface NetworkArtifacts {
    [name: string]: ArtifactRecord;
}

export interface ArtifactsStorage {
    [networkId: number]: NetworkArtifacts;
}
