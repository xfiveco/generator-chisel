/** @type {import('stylelint').Config} */
const stylelintConfig = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-css-modules',
    'stylelint-config-recess-order', // TODO: consider alternatives
    'stylelint-prettier/recommended',
    'stylelint-config-prettier-scss',
  ],

  rules: {
    'color-function-notation': null,
    'scss/function-no-unknown': null,
    'selector-class-pattern': [
      '^((([a-z][a-z0-9]*)(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?)|((__)?([a-z][a-z0-9]*)([A-Z][a-z0-9]*)*))$',
      {
        message: (name) =>
          `Expected class selector "${name}" to be camelCase, __camelCase, kebab-case or bem__bem--bem`,
      },
    ],
    'scss/dollar-variable-pattern': null,
    'scss/at-extend-no-missing-placeholder': null,
    'no-descending-specificity' : null,
  },
};

export default stylelintConfig;
