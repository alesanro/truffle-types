# truffle-types

## Publishing

Lerna tool have some issue with checking changed packages and publishing only REALLY updated modules. Until this issue will be fixed ([MR is here](https://github.com/lerna/lerna/pull/1712)) we need to do the following:

- remove `—first-parent` in  `@lerna/describe-ref/lib/describe-ref.js`

	It will look into all tags to check changes from this point (event other branches)
