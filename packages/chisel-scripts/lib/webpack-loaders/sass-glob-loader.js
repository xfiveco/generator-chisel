// Based on https://github.com/mikevercoelen/gulp-sass-glob/blob/255ee047789e69c82d5e3fc87452360ef8c56f41/src/index.js

// we initially used custom dart-sass importer instead of this but there
// is noticeable performance difference

const path = require('path');
const globby = require('globby');

const IMPORT_RE = /^([ \t]*(?:\/\*.*)?)@import\s+["']([^"']+(?:\.scss|\.sass)?)["'];?([ \t]*(?:\/[/*].*)?)$/gm;

module.exports = async function sassGlobLoader(content) {
  // console.log(`Sass glob loader for ${this.resourcePath}`);

  const file = this.resourcePath;
  const base = path.dirname(file);

  const newContent = content.replace(
    IMPORT_RE,
    (importRule, startComment, globPattern, endComment) => {
      if (globby.hasMagic(globPattern)) {
        const files = globby.sync(globPattern, { cwd: base }).sort();

        const filesString = files.map((f) => `@import '${f}';`).join('\n');

        // Inlining sources here makes sass build even faster
        // but breaks source maps
        // const filesString = files
        //   .map((f) => fs.readFileSync(path.join(base, f), 'utf8'))
        //   .join('\n');

        return startComment + filesString + endComment;
      }

      return importRule;
    },
  );

  // console.log(newContent);

  return newContent;
};
