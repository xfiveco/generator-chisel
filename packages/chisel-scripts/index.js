function adjustWebpackConfig(baseConfig, directory) {
  const { sync: glob } = require('fast-glob');
  const pathMod = require('path');
  const CopyWebpackPlugin = require(require.resolve('copy-webpack-plugin', {
    paths: [directory],
  }));

  const src = pathMod.join(directory, 'src');
  const isProduction = process.env.NODE_ENV === 'production';
  const packageJson = require(pathMod.join(directory, 'package.json'));

  const [blockMetadataFiles, scriptsFiles, stylesFiles] = [
    '**/block.json',
    'scripts/*.{js,jsx,ts,tsx}',
    'styles/*.scss',
  ].map((pattern) =>
    glob(pattern, {
      absolute: true,
      cwd: src,
    }),
  );

  const entriesFromFiles = (files) =>
    Object.fromEntries(
      files.map((file) => {
        const name = pathMod.join(
          pathMod.dirname(pathMod.relative(src, file)),
          pathMod.basename(file, pathMod.extname(file)),
        );
        return [name, file];
      }),
    );

  const entry = {
    ...(blockMetadataFiles.length > 0 && typeof baseConfig.entry === 'function' ? baseConfig.entry() : baseConfig.entry || {}),
    ...entriesFromFiles(scriptsFiles),
    ...entriesFromFiles(stylesFiles),
  };

  const getUrl = (() => {
    let url;

    return () =>
      (url ||= (() => {
        const { execSync } = require('node:child_process');
        try {
          const stdout = execSync(
            'npm run --silent wp option get home',
            {
              cwd: directory,
              encoding: 'utf8',
              shell: true,
            },
          );
          return stdout.trim();
        } catch (e) {
          throw new Error('Failed to get current website url', { cause: e });
        }
      })());
  })();

  const performance = {
    maxAssetSize: 512 * 1024,
    maxEntrypointSize: 512 * 1024,
    hints: isProduction ? 'warning' : false,
  };

  const isMultiConfig = Array.isArray(baseConfig);

  const updatedConfig = isMultiConfig
  ? baseConfig.map((config, index) => {
      let configEntry = {};

      // Config 0: standard build - JS + styles
      if (index === 0) {
        configEntry = {
          ...(blockMetadataFiles.length > 0 && typeof config.entry === 'function' ? config.entry() : config.entry || {}),
          ...entriesFromFiles(scriptsFiles),
          ...entriesFromFiles(stylesFiles),
        };
      }
      // Config 1: ESM build - For block only
      else if (index === 1) {
        configEntry = {
          ...(blockMetadataFiles.length > 0 && typeof config.entry === 'function' ? config.entry() : config.entry || {}),
        };
      }

      return {
        ...config,
        entry: configEntry,
        resolve: {
        ...(config.resolve || {}),
        alias: {
            ...((config.resolve && config.resolve.alias) || {}),
            '~design$': pathMod.join(src, 'design'),
          },
        },
        performance: performance,
        devServer: config.devServer && {
          ...config.devServer,
        allowedHosts: [new URL(getUrl()).host],
        ...(process.env.CHISEL_PORT && {
          host: '0.0.0.0',
          port: Number(process.env.CHISEL_PORT) + 1,
          client: {
            ...config.devServer.client,
            overlay: {
              errors: true,
              warnings: false,
              runtimeErrors: false,
            },
            webSocketURL: new URL(getUrl())
              .toString()
              .replace(process.env.CHISEL_PORT, Number(process.env.CHISEL_PORT) + 1),
          },
        }),
      },
      optimization: {
        ...config.optimization,
        ...(!isProduction && { runtimeChunk: index === 0 ? 'single' : false }),
      },
      plugins: [
        ...config.plugins,
        new CopyWebpackPlugin({
          patterns: [
            {
              from: '**/*.twig',
              context: 'src',
              noErrorOnMissing: true,
            },
          ],
        }),
      ],
      };
    })
  : {
      ...baseConfig,
      entry,
      resolve: {
        ...(baseConfig.resolve || {}),
        alias: {
          ...((baseConfig.resolve && baseConfig.resolve.alias) || {}),
          '~design$': pathMod.join(src, 'design'),
        },
      },
      performance: performance,
      devServer: baseConfig.devServer && {
        ...baseConfig.devServer,
      allowedHosts: [new URL(getUrl()).host],
      ...(process.env.CHISEL_PORT && {
        host: '0.0.0.0',
        port: Number(process.env.CHISEL_PORT) + 1,
        client: {
          ...baseConfig.devServer.client,
          overlay: {
            errors: true,
            warnings: false,
            runtimeErrors: false,
          },
          webSocketURL: new URL(getUrl())
            .toString()
            .replace(process.env.CHISEL_PORT, Number(process.env.CHISEL_PORT) + 1),
        },
      }),
    },
    optimization: {
      ...baseConfig.optimization,
      ...(!isProduction && { runtimeChunk: 'single' }),
    },
    plugins: [
      ...baseConfig.plugins,
      new CopyWebpackPlugin({
        patterns: [
          {
            from: '**/*.twig',
            context: 'src',
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
  };

  return updatedConfig;
}

module.exports.adjustWebpackConfig = adjustWebpackConfig;
