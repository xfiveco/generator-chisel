/* eslint import/no-extraneous-dependencies: ["error", { "devDependencies": true }], global-require: off */

module.exports = {
  plugins: [
    require('autoprefixer')({ grid: 'autoplace' }),
    require('@jakub300/postcss-normalize')(),
  ],
};
