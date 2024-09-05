const listStagedConfig = {
  '*.{cjs,mjs,js,jsx,ts,tsx}': ['eslint --fix'],
  '*.vue': ['stylelint --fix', 'eslint --fix --allow-empty-input'],
  '*.{json,md,yml}': ['prettier --write'],
  '*.{css,scss}': ['stylelint --fix --allow-empty-input'],
};

export default listStagedConfig;
