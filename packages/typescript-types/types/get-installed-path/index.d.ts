declare module "get-installed-path" {

    interface Options {
        cwd?: string;
        paths?: string[];
        local?: boolean;
    }

    export function getInstalledPath(name: string, opts?: Options): Promise<string>;
    export function getInstalledPathSync(name: string, opts?: Options): string;
}
