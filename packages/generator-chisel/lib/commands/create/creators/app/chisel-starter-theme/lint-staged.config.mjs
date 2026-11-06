const lintStagedConfig = {
  '*.{cjs,mjs,js,jsx,ts,tsx}': ['eslint --fix'],
  '*.vue': ['stylelint --fix', 'eslint --fix'],
  '*.{json,md,yml}': ['prettier --write'],
  '*.{css,scss}': ['stylelint --fix --allow-empty-input'],
  '*.php': ['npm run phpcs'],
  '*.twig': ['npm run twigcs'],
};

export default lintStagedConfig;
