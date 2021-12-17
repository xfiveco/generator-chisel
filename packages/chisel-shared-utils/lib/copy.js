module.exports.copy = async function copy(options = {}) {
  const fs = require('fs-extra');
  const path = require('path');
  const globby = require('globby');
  const { template } = require('lodash');
  const slash = (str) => str.replace(/\\/g, '/');
  const CHISEL_TEMPLATE = /\.chisel-tpl(?:$|(?=\.))/;

  const {
    expandDirectories = true,
    dot = true,
    from: basePath = process.cwd(),
    to = process.cwd(),
    templateData = {},
  } = options;
  let { file = ['.'] } = options;

  if (!Array.isArray(file)) file = [file];
  const basePathPosix = slash(basePath);
  const filesPaths = file.map((p) => {
    return path.posix.join(basePathPosix, p);
  });
  const files = await globby(filesPaths, {
    expandDirectories,
    cwd: basePath,
    dot,
  });

  const promises = files.map((f) => {
    const relative = path.relative(basePath, f);
    let target = path.resolve(to, relative);

    if (f.match(CHISEL_TEMPLATE)) {
      target = target.replace(CHISEL_TEMPLATE, '');

      return fs
        .readFile(f, { encoding: 'utf8' })
        .then((fileBody) =>
          fs.outputFile(
            target,
            template(fileBody, { sourceURL: f })(templateData),
          ),
        );
    }

    return fs.copy(f, target, { overwrite: true });
  });

  return Promise.all(promises);
};
