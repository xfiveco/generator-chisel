const { getOptions } = require('loader-utils');
const fs = require('fs-extra');
const { loaderOptionsSymbol } = require('./index');

module.exports = async function stringLoader(content) {
  // console.log(`Content loader for ${this.resourcePath}`);

  const loaderOptions = getOptions(this)[loaderOptionsSymbol];

  if (!loaderOptions) {
    throw new Error('Options not passed');
  }

  const { api, options, filesMap } = loaderOptions;

  // console.log(typeof loaderOptions);
  // console.log(Object.keys(loaderOptions));
  const post = filesMap[this.resourcePath];

  if (!post) {
    throw new Error(`Post for ${this.resourcePath} not found`);
  }

  await post.loadContent(content);

  const template = post.data().template || 'post';

  const templatePath = api.resolve(
    options.source.base,
    options.source.templates,
    `${template}.twig`,
  );

  this.addDependency(templatePath);
  const templateContent = await fs.readFile(templatePath, 'utf8');

  return { isContent: true, post, templateContent, templatePath };
};
