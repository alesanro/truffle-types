# Artifacts dependency tool

Gathers artifacts from different sources under the single root.

## Config

Default config filename `dep-contracts.json` but it could be provided manually.

### Structure

- `destinationDir` - destination directory where all artifacts will be placed
- `contracts` - array of source contracts/directories with contracts that should be fetched. Format of path could differ:
  - full path to file/directory, `"../airdrop-contracts/build/contracts"` or `"../airdrop-contracts/build/contracts/Airdrop.json"`
  - npm package name + filename/directory, `"@laborx/airdrop-contracts/build/contracts/Airdrop.json"`
  - here also could be passed object in a format:

  ```json
  {
    "path": "path to contract",
    "prefix": "optional prefix that will be added to copied (fetched) files, could be skipped"
  }
  ```
    `prefix` is used as a namespace for added files and could allow to separate the same named files but with different content.

Example:

```json
{
  "destinationDir": "./artifacts",
  "contracts": [
    "@laborx/airdrop-contracts/build/contracts/Airdrop.json",
    "../actions-tracking/build/contracts"
  ]
}
```

or


```json
{
  "destinationDir": "./artifacts",
  "contracts": [
    "@laborx/airdrop-contracts/build/contracts/Airdrop.json",
    "../actions-tracking/build/contracts",
    {
      "path": "../actions-tracking/build/contracts",
      "prefix": "AC"
    },
    {
      "path": ".@laborx/airdrop-contracts/build/contracts",
      "prefix": "Airdrop_"
    },
    {
      "path": "@laborx/airdrop-contracts/build/contracts/Airdrop.json",
    }

  ]
}
```

## Using

### CLI

```bash
npx @truffle-types/dep-contracts --config ./dep-contracts.json --force
```

### Code

```typescript
import { exportDependenciesFromConfig } from "@truffle-types/dep-contracts";

const outputFiles = exportDependenciesFromConfig("./dep-contracts.json", {
	force: false
});

// or

const outputFiles = exportDependencies([
	"@laborx/airdrop-contracts/build/contracts/Airdrop.json",
	"../actions-tracking/build/contracts"
	],
	"./artifacts",
	{ force: false, cwd: "." }
)
```
