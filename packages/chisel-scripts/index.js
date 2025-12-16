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

  const preparedConfig = (config, index = null) => {
    return {
      ...config,
      output: {
        ...config.output,
        clean: isProduction,
      },
      resolve: {
        ...(config.resolve || {}),
        alias: {
          ...((config.resolve && config.resolve.alias) || {}),
          '~design$': pathMod.join(src, 'design'),
        },
      },
      performance: {
        maxAssetSize: 512 * 1024,
        maxEntrypointSize: 512 * 1024,
        hints: isProduction ? 'warning' : false,
      },
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
        setupMiddlewares: (middlewares, devServer) => {
          if (!devServer) {
             return middlewares;
          }

          console.log(`🌐 Dev server ready at: ${getUrl()}`);

          return middlewares;
        }
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
      module: {
        ...(config.module || {}),
        rules: [
          ...(config.module?.rules || []),
          {
            test: /\.(png|jpe?g|gif|svg)$/i,
            type: 'asset/resource', // Load as file, not base64 in css - for smaller css file size.
          },
        ],
      },
    }
  }

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
      // Config 1: ESM build - For blocks only
      else if (index === 1) {
        configEntry = {
          ...(blockMetadataFiles.length > 0 && typeof config.entry === 'function' ? config.entry() : config.entry || {}),
        };
      }

      return {
        ...preparedConfig(config, index),
        entry: configEntry,
      }
    })
  : {
    ...preparedConfig(baseConfig),
    entry,
  }

  return updatedConfig;
}

module.exports.adjustWebpackConfig = adjustWebpackConfig;
