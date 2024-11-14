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

module.exports.getDevcontainerBaseImageVersion = async () => {
  const phpVersion = '8.3';

  try {
    const response = await fetch(
      'https://api.wordpress.org/core/version-check/1.7/',
    );

    if (!response.ok) {
      throw new Error('Failed to fetch WordPress version');
    }

    const data = await response.json();

    const { version } = data.offers.find(
      (offer) => offer.response === 'upgrade',
    );

    const versionForTag =
      version.split('.').length === 2 ? `${version}.0` : version;

    const tag = `${versionForTag}-php${phpVersion}`;

    const tagExists = await fetch(
      `https://hub.docker.com/v2/namespaces/library/repositories/wordpress/tags/${tag}`,
      { method: 'HEAD' },
    ).then((res) => {
      if (res.status === 200) return true;
      if (res.status === 404) return false;
      throw new Error(
        `Failed to check if tag exists: ${res.status} ${res.statusText}`,
      );
    });

    if (tagExists) {
      return tag;
    }
  } catch (e) {
    // noop
  }

  return `6-php${phpVersion}`;
};
