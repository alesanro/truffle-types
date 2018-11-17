export interface Contract {
    filename: string;
    contractArtifactName: string;
    contractInstanceName: string;
    contractLibRelativePath: string;
}
export interface TemplateContext {
    contracts: Contract[];
    generatedDir: string;
}
