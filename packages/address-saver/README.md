# Addresses saver for deployed contracts

Provides utils for managing addresses during deployment and delivery processes.

## Usage

### APIs

To import functions to work with contract addresses

```javascript
import { getDeployedAddresses, getUnwrappedDeployedAddressSync } from "@truffle-types/address-saver";
// or
const { getDeployedAddress, getUnwrappedDeployedAddressSync } = require("@truffle-types/address-saver");
```

### Commands

Have several bins that could be integrated with tests and CI

#### Merge addresses

That is usual operation when you update your contracts and need to update artifacts and addresses of already deployed contracts.

```bash
npx merge-addresses --source=./imported-deployed-addresses.json --target=./deployed-addresses.json --output=./deployed-addresses-new.json
```

Output option could be ignored, then results will be saved to target path.

#### Clean deployed addresses

Usually suitable while running tests and need to clean up temporary networks.

```bash
npx clean-addresses --addresses=./deployed-addresses.json --network=88
```

If you want to leave only selected range of networks run

```bash
npx clean-addresses --addresses=./deployed-addresses.json --saveNetworks=1 4 42 88
```

It will remove all network records except provided.
