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
    ...(blockMetadataFiles.length > 0 && baseConfig.entry()),
    ...entriesFromFiles(scriptsFiles),
    ...entriesFromFiles(stylesFiles),
  };

  const getUrl = (() => {
    let url;

    return () =>
      (url ||= (() => {
        const { execFileSync } = require('node:child_process');
        try {
          const stdout = execFileSync(
            'npm',
            ['run', '--silent', 'wp', 'option', 'get', 'home'],
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

  const updatedConfig = {
    ...baseConfig,
    entry,
    resolve: {
      ...baseConfig.resolve,
      alias: {
        ...baseConfig.resolve.alias,
        '~design$': pathMod.join(src, 'design'),
      },
    },
    devServer: baseConfig.devServer && {
      ...baseConfig.devServer,
      allowedHosts: [new URL(getUrl()).host],
      ...(process.env.CHISEL_PORT && {
        host: '0.0.0.0',
        port: Number(process.env.CHISEL_PORT) + 1,
        ...(() => {
          const webSocketURL = new URL(getUrl());
          webSocketURL.protocol = webSocketURL.protocol.replace('http', 'ws');
          webSocketURL.pathname = '/ws';
          const webSocketURLString = webSocketURL.toString();

          if (!webSocketURLString.includes(process.env.CHISEL_PORT)) {
            return;
          }

          return {
            client: {
              ...baseConfig.devServer.client,
              webSocketURL: webSocketURL
                .toString()
                .replace(
                  process.env.CHISEL_PORT,
                  Number(process.env.CHISEL_PORT) + 1,
                ),
            },
          };
        })(),
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
