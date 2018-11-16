import { existsSync, mkdirSync } from "fs";
import { sep, join, parse } from "path";


export function createPathSync(path: string): void {
    const parsedPath = parse(path);
    parsedPath.dir.split(sep).reduce((currentPath, folder) => {
        currentPath += folder + sep;
        if (!existsSync(currentPath)) {
            mkdirSync(currentPath);
        }
        return currentPath;
     }, "");
}

