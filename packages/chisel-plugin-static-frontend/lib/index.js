const fs = require('fs-extra');
const path = require('path');
const globby = require('globby');

// use symbol to pass options so they're not stringified when inspecting
const loaderOptionsSymbol = Symbol('loaderOptions');

const slash = (str) => str.replace(/\\/g, '/');

function mapExcept(map, toRemove) {
  if (!toRemove) {
    return map;
  }

  return Object.fromEntries(
    Object.entries(map).filter(([, value]) => value !== toRemove),
  );
}

function setParentForChildren(posts) {
  posts.forEach((post) => {
    const children = post.children();
    children.forEach((child) => {
      child._setParent(post);
    });
  });
}

function setChildren(map) {
  const keysWithoutSelf = Object.keys(mapExcept(map, map['']));
  if (map['']) {
    map['']._setChildren(
      keysWithoutSelf.map((key) => map[key]['']).filter(Boolean),
    );
  }
  keysWithoutSelf.forEach((key) => setChildren(map[key]));
}

module.exports = (api, options) => {
  const templatesPath = api.resolve(
    options.source.base,
    options.source.templates,
  );
  const contentPath = api.resolve(options.source.base, options.source.content);

  const postsMap = {};
  const postsDeepMap = {};
  const filesMap = {};

  const loaderOptions = {
    options,
    api,
    postsMap,
    postsDeepMap,
    filesMap,
  };

  api.chainWebpack(async (webpackConfig) => {
    const chiselLoadersOptions = {
      options: 'are hidden',
      [loaderOptionsSymbol]: loaderOptions,
    };

    // prettier-ignore
    webpackConfig.module.rule('twig').test(/\.twig$/)
      .include
        .add(templatesPath)
        .add(contentPath)
        .end()
      .use('chisel-twig-loader')
        .loader(require.resolve('./twig-loader'))
        .options(chiselLoadersOptions);

    // prettier-ignore
    // webpackConfig.module.rule('content').test(/\.(?:md|json)}}$/)
    webpackConfig.module.rule('content').test(/\.(?:md|json)$/)
      .type('javascript/auto') // https://stackoverflow.com/a/49083832
      .include
        .add(contentPath)
        .end()
      .use('chisel-twig-loader')
        .loader(require.resolve('./twig-loader'))
        .options(chiselLoadersOptions)
        .end()
      .use('chisel-content-loader')
        .loader(require.resolve('./content-loader'))
        .options(chiselLoadersOptions);

    webpackConfig
      .plugin(`inject-revisioned`)
      .use(require('./inject-revisioned'));

    const contentPathExists = await fs.pathExists(contentPath);
    const templatesBasePath = contentPathExists ? contentPath : templatesPath;
    const templates = path.join(
      templatesBasePath,
      contentPathExists ? '**/*.{twig,md,json}' : '*.twig',
    );

    const templatesFiles = await globby(slash(templates));

    const idForFile = (file) => {
      const relative = path.relative(templatesBasePath, file);

      return slash(
        path.join(
          path.dirname(relative),
          `${path.basename(relative, path.extname(relative))}`,
        ),
      );
    };

    if (contentPathExists) {
      const postCreator = require('./Post');
      const getPostsCreator = require('./get-posts');
      const Datastore = require('nedb-promises');
      const db = new Datastore();
      loaderOptions.db = db;
      loaderOptions.getPostsCreator = getPostsCreator(loaderOptions);
      const Post = postCreator(loaderOptions);

      for (const file of templatesFiles) {
        const ext = path.extname(file);
        const id = idForFile(file);

        if (postsMap[id]) {
          throw new Error(`Post with id ${id} already exists`);
        }

        const post = new Post({
          id,
          type: ext.substr(1),
          file: path.resolve(file),
        });

        postsMap[id] = post;
        filesMap[path.resolve(file)] = post;

        const idParts = id.split('/');
        let map = postsDeepMap;
        while (idParts.length) {
          const el = idParts.shift();
          if (!map[el]) {
            map[el] = {};
          }
          map = map[el];
        }
        map[''] = post;
      }

      setChildren(postsDeepMap);
      setParentForChildren(Object.values(postsMap));

      const posts = Object.values(postsMap);

      await db.insert(posts.map((post) => post.toJSON()));
    }

    templatesFiles.forEach((file) => {
      const id = idForFile(file);
      webpackConfig
        .plugin(`template-${id}`)
        .use(require('html-webpack-plugin'), [
          {
            filename: `${id}.html`,
            template: file,
            inject: false,
            minify: Boolean(
              process.env.NODE_ENV === 'production' &&
                options.staticFrontend.buildFormat === 'minify',
            ),
          },
        ]);
    });

    const publicDir = api.resolve(options.source.base, options.source.public);
    if (await fs.pathExists(publicDir)) {
      const copyOptions = {
        patterns: [
          {
            from: publicDir,
            to: api.resolve(options.output.base),
            toType: 'dir',
            globOptions: {
              ignore: ['**/.DS_Store', '**/.keep'],
            },
            noErrorOnMissing: true,
          },
        ],
      };
      // prettier-ignore
      webpackConfig
        .plugin('copy')
          .use(require('copy-webpack-plugin'), [copyOptions])
    }

    if (options.staticFrontend.htmlHint) {
      const htmlHintPath = api.resolve('.htmlhintrc');
      const htmlHintConfig = (await fs.pathExists(htmlHintPath))
        ? JSON.parse(await fs.readFile(htmlHintPath, { encoding: 'utf8' }))
        : {};

      webpackConfig
        .plugin(`htmlhint`)
        .use(require('./htmlhint'), [
          { htmlHintConfig, distPath: api.resolve(options.output.base) },
        ]);
    }
  });

  const buildCommand = api.service.programCommands.build;
  if (buildCommand) {
    buildCommand.option('--no-htmlhint');

    api.service.programCommands.build.on('option:no-htmlhint', () => {
      options.staticFrontend.htmlHint = false;
    });
  }

  ['dev', 'add-page'].forEach((command) => {
    require(`./commands/${command}`)(api, options);
  });
};

module.exports.loaderOptionsSymbol = loaderOptionsSymbol;
