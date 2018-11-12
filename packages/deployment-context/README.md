# Deployment context

Provides structure for deployment context where all needed information could be held.

## Install

```bash
yarn add @truffle-types/deployment-context
```

## Usage

Import in migrations or tests:

```typescript
import ContractDeploymentContext from "@truffle-types/deployment-context";

//...

const deploymentContext = new ContractDeploymentContext(web3, artifacts, deployer, "./deployed-addresses.json");
```
