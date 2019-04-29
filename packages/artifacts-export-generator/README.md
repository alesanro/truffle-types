# Artifacts contents exporter

Generates typescript contents file with exported members from provided folder.

## Usage

`yarn add -D @truffle-types/artifacts-export-generator`

`npm install @truffle-types/artifacts-export-generator`

### JavaScript/Typescript

```javascript
import { generateArtifactExports } from "@truffle-types/artifacts-export-generator";

const artifactsDir = "./build/contacts";
const exportContentsFile = "./src/artifacts.ts";
const EXCLUDE_PATTERN = "!(*.sol)";

generateArtifactExports(artifactsDir, exportContentsFile, EXCLUDE_PATTERN);
```

### Bash

```bash
generate-artifacts-content --artifactsDir ./build/contracts --destination ./src/artifacts.ts --exclude "!(*.sol)"
```

### NPX

```bash
npx -p @truffle-types/artifacts-export-generator generate-artifacts-content --artifactsDir ./build/contracts --destination ./src/artifacts.ts --exclude "!(*.sol)"

```
