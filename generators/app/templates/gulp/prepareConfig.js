const path = require('path');
<% if (projectType == 'wp-with-fe') { %>
// WordPress destination paths should be inside WP template
function prepareWpConfig(config) {
  const { dest, src } = config;
  const wordpressTemplatePath = path.join(
    dest.wordpress,
    'wp-content/themes',
    dest.wordpressTheme
  );

  dest.base = path.join(
    dest.wordpress,
    'wp-content/themes',
    dest.wordpressTheme,
    dest.base
  );

  src.templatesWatch = [
    path.join(wordpressTemplatePath, src.templatesPath, '**/*.twig'),
    path.join(wordpressTemplatePath, '**/*.php'),
  ];

  return config;
}
<% } %>
function prepareConfig(config) {
  const { <% if (projectType != 'wp-with-fe') { %>templatesWatch, <% } %>templatesBuild, base } = config.src;
<% if (projectType == 'wp-with-fe') { %>
  Object.assign(config, prepareWpConfig(config));<% } else { %>
  templatesWatch[0] = path.join(base, templatesWatch[0]);
  templatesWatch[1] = path.join(base, templatesWatch[1]);<% } %>
  templatesBuild[0] = path.join(base, templatesBuild[0]);

  return config;
}

module.exports = prepareConfig;
