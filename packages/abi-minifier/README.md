# ABI minifier (abi-minifier)

Command, for example:

`./abi-minifier --buildDir ./build/contracts --outputDir ./build/contracts-minified`

where

- `--buildDir` or `-b` - directory where truffle (or compiler) places compiled contract (abi + bytecode + networks + etc.)
- `--outputDir` or `-o` - directory where minified versions of compiled contracts will be stored

By default no postfix will be added, so contract filenames remain the same.

---
For more options take a look at

`./abi-minifier --help`

## Library

This package could be also used as a library of tool to access from source code

```javascript
const { minifyABI } = require("@truffle-types/abi-minifier");

minifyABI("./build/contracts", "./build/contracts-minified");
```
