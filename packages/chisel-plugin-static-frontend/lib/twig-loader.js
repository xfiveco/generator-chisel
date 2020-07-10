const { factory: twigFactory } = require('twig');
const { getOptions } = require('loader-utils');
const fs = require('fs-extra');
const path = require('path');
const {
  cloneDeepWith,
  has,
  omit,
  isPlainObject,
  toPairs,
  fromPairs,
} = require('lodash');
const prettify = require('js-beautify');
const { loaderOptionsSymbol } = require('./index');

const sharedFunctions = {
  isDev: () => process.env.NODE_ENV === 'development',
  className: (...args) => {
    const name = args.shift();
    if (typeof name !== 'string' || name === '') {
      return '';
    }
    const classes = [name];
    let el;
    for (let i = 0; i < args.length; i += 1) {
      el = args[i];
      if (el && typeof el === 'string') {
        classes.push(`${name}--${el}`);
      }
    }
    return classes.join(' ');
  },
};

module.exports = async function chiselTwigLoader(loaderContent) {
  // console.log(`Twig loader for ${this.resourcePath}`);
  const isContent = loaderContent.isContent || false;
  const content = isContent ? loaderContent.templateContent : loaderContent;
  const twigPath = isContent ? loaderContent.templatePath : this.resourcePath;
  const twigContext = {};

  const loaderOptions = getOptions(this)[loaderOptionsSymbol];

  if (!loaderOptions) {
    throw new Error('Options not passed');
  }

  const { options, db, postsMap, filesMap } = loaderOptions;

  // console.log({ path: this.resourcePath });
  const functions = {
    ...sharedFunctions,
    revisionedPath: (fullPath) => {
      const pathBase64 = Buffer.from(fullPath, 'utf8').toString('base64');
      return `---CHISEL-REVISIONED-PATH---${pathBase64}---`;
    },
    assetPath: (file) =>
      new Promise((resolve, reject) => {
        // TODO: nested
        this.loadModule(`~assets/${file}`, (err, source) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(JSON.parse(source.replace(/^[^"]+/, '').replace(/;$/, '')));
        });
      }),
    getDistPath: () => './',
  };

  const post = loaderContent.post || filesMap[this.resourcePath];
  if (post) {
    twigContext.post = post;

    const original = { ...functions };
    let relativeToPost = path.posix.relative(
      `/${path.posix.dirname(post.id())}`,
      '/',
    );
    if (relativeToPost) relativeToPost += '/';
    Object.assign(functions, {
      revisionedPath: (fullPath) => {
        const orig = original.revisionedPath;
        return `${relativeToPost}${orig(fullPath)}`;
      },
      assetPath: async (file) => {
        const orig = original.assetPath;
        return `${relativeToPost}${await orig(file)}`;
      },
      getDistPath: () => relativeToPost || './',
      getPosts: async (query = {}, sort = { id: 1 }) => {
        if (typeof query === 'string') {
          query = JSON.parse(query);
        }

        // twig doesn't keep doesn't od properties in object, but they provide
        // _keys array with order
        const cloneCustomizer = (val) => {
          if (isPlainObject(val) && has(val, '_keys')) {
            const keys = val._keys;
            return cloneDeepWith(
              fromPairs(
                toPairs(omit(val, ['_keys'])).sort(
                  ([key1], [key2]) => keys.indexOf(key1) - keys.indexOf(key2),
                ),
              ),
              cloneCustomizer,
            );
          }

          return undefined;
        };

        const queryWithoutKeys = cloneDeepWith(query, cloneCustomizer);
        const sortWithoutKeys = cloneDeepWith(sort, cloneCustomizer);

        const postsRaw = await db.find(queryWithoutKeys);

        const posts = postsRaw.map(({ id }) => postsMap[id]);

        posts.forEach((loopPost) => {
          if (loopPost._file) {
            this.addDependency(loopPost._file);
          }
        });

        await Promise.all(
          posts.map((loopPost) => loopPost.loadContentWithLoader(this)),
        );

        await Promise.all(
          posts.map((loopPost) =>
            db.update({ id: loopPost.id() }, loopPost.toJSON()),
          ),
        );

        // we may update data that impacts query or sorting order
        const postsRaw2 = await db.find(queryWithoutKeys).sort(sortWithoutKeys);

        return postsRaw2.map(({ id }) => postsMap[id]);
      },
      postLink: (p) => p.link(post),
    });
  }

  const Twig = twigFactory();

  Twig.extend((TwigCore) => {
    TwigCore.Templates.registerLoader('fs', (location, params, callback) => {
      params.path = params.path || location;

      // console.log(`Twig load ${params.path}`);
      const fullPath = path.isAbsolute(params.path)
        ? params.path
        : path.resolve(this.rootContext, options.source.base, params.path);
      if (fullPath === twigPath) {
        params.data = content;
      } else {
        this.addDependency(fullPath);
        // possible optimization: short term cache to avoid often reading from fs
        params.data = fs.readFileSync(fullPath, 'utf8');
      }

      const template = new TwigCore.Template(params);
      if (typeof callback === 'function') {
        callback(template);
      }
      return template;
    });

    Object.entries(functions).forEach(([name, func]) => {
      Twig.extendFunction(name, func);
    });
  });

  const shouldPrettify = Boolean(
    process.env.NODE_ENV === 'production' &&
      options.staticFrontend.buildFormat === 'prettify',
  );

  const prettifyOptions = {
    indent_size: 2,
    preserve_newlines: false,
  };

  return Twig.twig({
    path: twigPath,
    base: 'templates/',
    rethrow: true,
    twigContext,
  })
    .renderAsync(twigContext)
    .then((data) => {
      if (shouldPrettify) {
        data = prettify.html(data, prettifyOptions);
      }

      return `export default ${JSON.stringify(data)};`;
    });
};
