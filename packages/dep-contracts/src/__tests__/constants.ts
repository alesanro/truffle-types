import { join } from "path";

export const SAMPLES_DIR = "./src/__tests__/samples";
export const FILES_SAMPLES_DIR = join(SAMPLES_DIR, "files");
export const EMPTY_PREFIX = "";
export const CONFIG_FILENAME_START_WITH_REGEX = /^file[1-3]\.txt/;
export const CONFIG_FILENAME_CONTAINS_REGEX = /file[1-3]\.txt/;
export const CONFIG_FOLDER_START_WITH_REGEX = /^files/;
