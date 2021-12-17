# stylelint-config-chisel

Stylelint config based on [stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard) with Prettier and custom additions.

## Prettier

You'll have to install Prettier on your own in order to use it. It won't be included by default when you install this package. Don't hesitate to add your own `.prettierrc` file to [customise code formatting](https://github.com/prettier/prettier#configuration-file).

## Installation

We recommend to use Yarn however you are free to use NPM. Snippet from the example below will install Eslint and Prettier as you'll need both of them to make use of this config.

```bash
yarn add --dev stylelint prettier stylelint-config-chisel
```

## Usage

Add this to your `.stylelintrc` or other stylelint configuration file:

```json
{
  "extends": "stylelint-config-chisel"
}
```
