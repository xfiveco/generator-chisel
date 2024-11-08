module.exports.prepareName = (name) => {
  const speakingUrl = require('speakingurl');
  const nameSlug = speakingUrl(name)
    .replace(/(?<=[^\d])-(\d+)/g, (_, d) => d)
    .replace(/[^a-z0-9-]/g, '-');

  const themeName = `${nameSlug}-chisel`;

  return {
    nameSlug,
    themeName,
    themePath: `wp-content/themes/${themeName}`,
  };
};

module.exports.getWordpressVersion = async () => {
  const response = await fetch(
    'https://api.wordpress.org/core/version-check/1.7/',
  );

  if (!response.ok) {
    throw new Error('Failed to fetch WordPress version');
  }

  const data = await response.json();

  return data.offers.find((offer) => offer.response === 'upgrade').version;
};
