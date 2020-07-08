# eslint-config-chisel

Eslint config based on [Aribnb config](https://github.com/airbnb/javascript) you can use with ES6. Integrates with [Prettier](https://github.com/prettier/prettier).

## Prettier

You'll have to install Prettier on your own in order to use it. It won't be included by default when you install this package. Don't hesitate to add your own `.prettierrc` file to [customise code formatting](https://github.com/prettier/prettier#configuration-file).

## Installation

We recommend to use Yarn however you are free to use NPM. Snippet from the example below will install Eslint and Prettier as you'll need both of them to make use of this config.

```bash
yarn add --dev eslint prettier eslint-config-chisel
```

## Usage

Add this to your `.eslintrc` or other eslint configuration file:

```json
{
  "extends": "chisel"
}
```

## React

Additional `chisel/react` config is provided. It should be used **instead of** `chisel` in React projects.

## Nonstandard module resolution

This eslint config is monitoring if all imports/requires are resolving properly. It may not work if custom aliases (for example `~/` or `@/`) are used. In such cases [eslint-import-resolver-webpack](https://www.npmjs.com/package/eslint-import-resolver-webpack) should be added.
