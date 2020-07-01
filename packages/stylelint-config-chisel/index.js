// TODO: order?

// Some additions based on:
// * https://github.com/chrisvfritz/vue-enterprise-boilerplate/blob/890438c3b898d6ed921fd2d0e3b84f2fe7162d89/stylelint.config.js
// * https://github.com/bjankord/stylelint-config-sass-guidelines/blob/5bcf85acdb9ef37e4eeaf492b6b60aed4bc0d5e8/index.js#L81

module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  plugins: ['stylelint-scss', 'stylelint-prettier'],
  rules: {
    'prettier/prettier': true,

    // Based on old Chisel config:
    'selector-class-pattern':
      '^(?:(?:a|o|c|u|t|s|is|has|_|js|qa)-)?[a-zA-Z0-9]+(?:-[a-zA-Z0-9\\@]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:\\[.+\\])?$',
    'font-family-name-quotes': 'always-where-recommended',
    'function-url-quotes': 'always',
    'max-nesting-depth': 3,
    'property-no-vendor-prefix': true,
    'selector-max-compound-selectors': 3,
    'selector-max-id': 0,
    'selector-no-qualifying-type': [true, { ignore: ['attribute'] }],
    'value-keyword-case': ['lower', { ignoreKeywords: 'BlinkMacSystemFont' }],

    // Additions:
    'selector-no-vendor-prefix': true,
    'value-no-vendor-prefix': true,
    'scss/double-slash-comment-whitespace-inside': 'always',
    'scss/dollar-variable-no-missing-interpolation': true,
    'scss/selector-no-redundant-nesting-selector': true,
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'scss/at-extend-no-missing-placeholder': true,
    'scss/at-import-partial-extension-blacklist': ['scss'],

    // Additions that MAY CONFLICT WITH PRETTIER:
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
        severity: 'warning',
      },
    ],
    'at-rule-empty-line-before': [
      'always',
      {
        except: ['blockless-after-same-name-blockless', 'first-nested'],
        ignore: ['after-comment'],
        ignoreAtRules: ['else'],
      },
    ],
  },
};
