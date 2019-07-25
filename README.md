# truffle-types

Organizes utilities and typescript types into single repository

## Install

```bash
yarn run bootstrap
yarn run build
```

### Test

```bash
yarn run test
```

### Release

Make sure that no uncommitted changes are left.

```bash
yarn run release
yarn run release-clean
```

## Notes

### Folder `overrides`

Shortly its about using `mocha` and `jest` test runners and clashing of their types.

[Link about the reason](https://github.com/Microsoft/TypeScript/issues/11437?source=post_page---------------------------#issuecomment-252381205).

More in [Medium article](https://medium.com/@elenasufieva/handling-type-declarations-clash-in-typescript-b05b10723f47)
