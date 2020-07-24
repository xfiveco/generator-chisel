module.exports = {
  root: true,

  extends: 'chisel',

  env: {
    node: true,
  },

  rules: {
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-await-in-loop': 'off',
    'no-param-reassign': 'off',
    'no-console': 'off',
    'no-underscore-dangle': 'off',

    // Airbnb except for of
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
  },

  overrides: [
    {
      files: ['./scripts/testSetup*.js', '**/__tests__/**/*.js'],

      env: {
        jest: true,
      },

      rules: {
        // 'node/no-extraneous-require': 'off',
      },
    },
  ],
};
