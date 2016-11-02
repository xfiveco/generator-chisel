
var path = require('path');

/**
* WordPress destination paths should be inside WP template
*/
function prepareWpConfig(config) {
  var dest = config.dest;
  dest.base = path.join(dest.wordpress, 'wp-content/themes',
    dest.wordpressTheme, dest.base);
  return config;
}

function prepareConfig(config) {
  <% if (projectType == 'wp-with-fe') { %>
  config = prepareWpConfig(config);
  <% } %>
  var src = config.src;
  src.templatesBuild[0] = path.join(src.base, src.templatesBuild[0]);
  src.templatesWatch[0] = path.join(src.base, src.templatesWatch[0]);
  src.templatesWatch[1] = path.join(src.base, src.templatesWatch[1]);
  return config;
}

module.exports = prepareConfig;
