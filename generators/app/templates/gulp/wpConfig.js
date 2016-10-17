
var path = require('path');

/**
* WordPress destination paths should be inside WP template
*/
function prepareWpConfig(config) {
  var dest = config.dest;
  var theme = path.join(dest.wordpress, 'wp-content/themes', dest.wordpressTheme);
  var overwrite = ['assets', 'base', 'revManifest', 'scripts', 'styles'];
  overwrite.forEach((name) => {
    dest[name] = path.join(theme, dest[name]);
  })
  return config;
}

module.exports = prepareWpConfig;
