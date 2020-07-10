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

  staticFrontend: {
    serveDist: false,
    skipHtmlExtension: false,
    buildFormat: 'prettify', // pretty, minify, as-is/undefined
    htmlHint: true,
  },

  plugins: [],
};
