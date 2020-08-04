module.exports = {
  source: {
    base: 'src',
    scripts: 'scripts',
    styles: 'styles',
    assets: 'assets',
    templates: 'templates',
    content: '../content',
    public: '../public',
  },

  output: {
    base: 'dist',
    scripts: 'scripts',
    styles: 'styles',
    assets: 'assets',
  },

  wp: {
    directoryName: 'wp',
  },

  staticFrontend: {
    serveDist: false,
    skipHtmlExtension: false,
    buildFormat: 'prettify', // prettify, minify, as-is/undefined
    htmlHint: true,
  },

  plugins: [],
};
