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
      allowedHosts: [new URL(packageJson.chisel.url).host],
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
