# Artifacts dependency tool

Gathers artifacts from different sources under the single root.

## Config

Default config filename `dep-contracts.json` but it could be provided manually.

### Structure

- `destinationDir` - destination directory where all artifacts will be placed
- `contracts` - array of source contracts/directories with contracts that should be fetched. Format of path could differ:
  - full path to file/directory, `"../airdrop-contracts/build/contracts"` or `"../airdrop-contracts/build/contracts/Airdrop.json"`
  - npm package name + filename/directory, `"@laborx/airdrop-contracts/build/contracts/Airdrop.json"`

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

## Using

### CLI

```bash
npx @truffle-types/dep-contracts --config ./dep-contracts.json --force
```

### Code

```typescript
import { exportDependenciesFromConfig } from "@laborx/dep-contracts";

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
