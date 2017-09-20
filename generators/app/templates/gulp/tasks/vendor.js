'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var through2 = require('through2');

function monitorFileList(fileList) {
  const readFiles = [];
  return through2.obj(
    function(file, enc, cb) {
      readFiles.push(file.path);
      cb(null, file);
    },
    function(cb) {
      if(fileList.resolved.length != readFiles.length) {
        const missingFiles = [];
        fileList.resolved.forEach((val, index) => {
          if(readFiles.indexOf(val) == -1) {
            missingFiles.push(`${fileList.parsed[index]} resolved to ${val}`);
          }
        })
        cb(new Error(
  `
  ${chalk.red('It looks like some files from vendor.json has not been found:')}
  ${missingFiles.join(',\n')}
  `
        ));
        return;
      }
      cb();
    }
  );
}

var bundleVendorTask = function (gulp, plugins, config, helpers) {
  function resolveFileList(fileList) {
    const resolvedFileList = fileList.slice();
    for(let i = 0; i < resolvedFileList.length; i++) {
      const val = resolvedFileList[i];
      if(typeof val == 'string' && val.length > 1) {
        if(val[0] == '/') {
          resolvedFileList[i] = val.substr(1);
        } else {
          resolvedFileList[i] = path.join(config.src.base, config.src.vendorBase, resolvedFileList[i]);
        }
        resolvedFileList[i] = path.resolve(process.cwd(), resolvedFileList[i]);
      }
    }
    return resolvedFileList;
  }

  function getFileList() {
    var fileList = '';
    var parsedFileList;

    try {
      fileList = fs.readFileSync(fileListPath, 'utf8');
    } catch (error) {
      throw new Error(
        chalk.red("Couldn't open vendor.json. Please make sure it's present in your /src/scripts directory!")
      );
    }

    try {
      parsedFileList = JSON.parse(fileList);
    } catch (error) {
      throw new Error(chalk.red(error));
    }

    if(!Array.isArray(parsedFileList)) {
      throw new Error(chalk.red('vendor.json is not Array'));
    }

    return {
      parsed: parsedFileList,
      resolved: resolveFileList(parsedFileList),
    };
  };

  const fileListPath = path.join(config.src.base, config.src.vendorConfig);

  gulp.task('vendor-watch', function() {
    const fileList = getFileList();

    if (fileList.resolved.length) {
      return gulp.src(fileList.resolved)
        .pipe(plugins.plumber(helpers.onError))
        .pipe(monitorFileList(fileList))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('vendor.js'))
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(path.join(config.dest.base, config.dest.scripts)));
    }

    return plugins.del([ path.join(config.dest.base, config.dest.scripts, 'vendor.js') ]);
  });

  gulp.task('vendor-build', function() {
    const fileList = getFileList();

    return gulp.src(fileList.resolved)
      .pipe(monitorFileList(fileList))
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.concat('vendor.js'))
      .pipe(plugins.mirror(
        plugins.uglify(),
        plugins.multipipe(
          helpers.removeSourceMap(),
          plugins.rename({suffix: '.full'})
        )
      ))
      .pipe(plugins.sourcemaps.write('./'))
      .pipe(plugins.rev())
      .pipe(plugins.revReplace())
      .pipe(gulp.dest(path.join(config.dest.base, config.dest.scripts)))
      .pipe(plugins.rev.manifest({
        path: path.join(config.dest.base, config.dest.revManifest),
        base: config.dest.base,
        merge: true
      }))
      .pipe(gulp.dest(config.dest.base));
  });
};

module.exports = bundleVendorTask;
