# Deployment context

Provides structure for deployment context where all needed information could be held.

## Install

```bash
yarn add @truffle-types/deployment-context
```

## Usage

Import in migrations or tests:

```typescript
import { DeploymentCoordinator } from "@truffle-types/deployment-context";

//...

const deploymentCoordinator = new DeploymentCoordinator(
  web3,
  artifacts,
  deployer,
  "./deployed-addresses.json"
);

//Actions with main context:

//get context
deploymentCoordinator.mainContext();

//Actions with deprecation context:

//create context
deploymentCoordinator.snapshot();

//get context
deploymentCoordinator.deprecationContext();

//delete context
deploymentCoordinator.finalizeSnapshot();
```

### API

Deployment coordinator provides the ability to manage several deployment contexts: **main and deprecation contexts**

Deprecation context, at the time of its creation, is a copy of the main context.

Main deployment context allows to use contract address read/write function.

Deprecation deployment context allows to use contract address readonly function.
