# Ethereum network state archiver/unarchiver

Provides ability to save/load network state into/from archive and preserve/restore it from some point. Could be useful to iterate through releases and updated migrations.

## Install

```bash
npm install --save-dev @truffle-types/network-archiver

yarn add -D @truffle-types/network-archiver
```

## Usage

You can use it directly from installed package or use `npx` to actually run it without installation.

First of all you need to create config file `eth-migrations-config.js`. Example of config file could be found in package's `examples/eth-migrations-config.js`.

### Save state

```bash
npx --package @truffle-types/network-archiver network-archiver save
```

Optionally `--commit` flag could be provided to automatically commit made changes.

### Unpack state

```bash
npx --package @truffle-types/network-archiver network-archiver unpack
```

### Update migrations dir

```bash
npx --package @truffle-types/network-archiver network-archiver cdir --migrationsDir=./next-migrations-dir
```
