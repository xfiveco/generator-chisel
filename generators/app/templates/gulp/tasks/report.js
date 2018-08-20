'use strict';

const path = require('path');
const through = require('through2');
const zlib = require('zlib');
const http = require('http');
const fs = require('fs');
const explore = require('source-map-explorer');
const os = require('os');
const opn = require('opn');

const MEBIBYTE = 1024 * 1024;

const files = {};
const exploredCache = new Map();

function listFiles({ destBase }) {
  return through.obj(function getInfoAboutFile(file, enc, callback) {
    const relativePath = path.relative(destBase, file.path);
    const bufferContents = Buffer.isBuffer(file.contents)
      ? file.contents
      : Buffer.from(file.contents);

    files[relativePath] = {
      path: file.path,
      hasSourceMap: false,
      size: bufferContents.length,
      sizeGzipped: -1,
      notes: [],
    };

    zlib.gzip(bufferContents, (err, zipped) => {
      if (err) {
        throw err;
      }

      files[relativePath].sizeGzipped = zipped.length;
      callback();
    });

    this.push(file);
  });
}

function markSouceMaps({ destBase }) {
  return through.obj((file, enc, callback) => {
    const relativePath = path.relative(destBase, file.path);

    if (!files[relativePath]) {
      return;
    }

    if (file.sourceMap && file.sourceMap.preExistingComment) {
      if (file.sourceMap.sources.length > 1) {
        files[relativePath].hasSourceMap = true;
      } else {
        files[relativePath].notes.push('only one file');
      }
    }

    callback();
  });
}

function escapeHTML(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function hasFile(resolvedPath) {
  if (!resolvedPath.endsWith('.html')) {
    return false;
  }

  const sourcePath = resolvedPath.slice(0, -5);

  return fs.existsSync(sourcePath);
}

function formatSize(n) {
  if (n < 1024) {
    return `${n} B`;
  } else if (n < MEBIBYTE) {
    return `${(n / 1024).toFixed(2)} KiB`;
  }
  return `${(n / MEBIBYTE).toFixed(2)} MiB`;
}

// https://github.com/shakyShane/dev-ip/blob/9f5a1b6154a16db88ca276c08426867c55924e61/lib/dev-ip.js
function getIp() {
  const networkInterfaces = os.networkInterfaces();
  const matches = [];

  Object.keys(networkInterfaces).forEach(item => {
    networkInterfaces[item].forEach(address => {
      if (address.internal === false && address.family === 'IPv4') {
        matches.push(address.address);
      }
    });
  });

  return matches;
}

function startServer({ destBase }) {
  const root = path.resolve(destBase);
  const server = http.createServer((req, res) => {
    const { url } = req;
    const resolvedPath = path.resolve(root, path.join(root, url));

    if (!resolvedPath.startsWith(root)) {
      res.writeHead(403);
      res.end();
      return;
    }

    if (url === '/') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });

      res.write(
        `<!doctype html><html lang="en"><title>Chisel SourceMap Reports</title>
        <table><thead><tr><td>Name</td><td>Size</td><td>Gzipped size</td>
        <td>Notes</td></tr></thead><tbody>`
      );

      const links = Object.keys(files)
        .sort()
        .map(link => {
          const file = files[link];
          const escapedLink = escapeHTML(link);
          return `
            <tr>
              <td>${
                file.hasSourceMap
                  ? `<a href="${escapedLink}.html">${escapedLink}</a>`
                  : escapedLink
              }</td>
              <td>${formatSize(file.size)}</td>
              <td>${formatSize(file.sizeGzipped)}</td>
              <td>${escapeHTML(file.notes.join(', '))}</td>
            </tr>
          `;
        });

      res.write(links.join(''));

      res.write('</tbody></table>');

      res.end();
    } else if (hasFile(resolvedPath)) {
      const sourcePath = resolvedPath.slice(0, -5);
      let explored;

      if (!exploredCache.has(sourcePath)) {
        try {
          explored = explore(sourcePath, { html: true });
          exploredCache.set(sourcePath, explored);
        } catch (e) {
          res.writeHead(500, {
            'Content-Type': 'text/plain; charset=utf-8',
          });
          res.write('Error when generating report:\n');
          res.end(e.message);
          return;
        }
      } else {
        explored = exploredCache.get(sourcePath);
      }

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });

      res.end(explored.html);
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(err => {
    if (err) {
      throw err;
    }

    const { port } = server.address();

    const urls = ['localhost', ...getIp()].map(
      host => `http://${host}:${port}`
    );

    console.log(`Bundle Report is started at ${urls.join(', ')}`);
    console.log('Use Ctrl+C to close it');

    opn(urls[0]).catch(() => {
      console.log(
        'Failed to open browser. Please open one of above adressess manually'
      );
    });
  });
}

module.exports = function reportTaskCreator(gulp, plugins, config) {
  const { dest, src } = config;

  gulp.task('report-prepare', () =>
    gulp
      .src([
        path.join(dest.base, dest.scripts, '**/*'),
        path.join(dest.base, dest.styles, '**/*'),
        '!**/*.map',
      ])
      .pipe(listFiles({ destBase: dest.base }))
      .pipe(plugins.sourcemaps.init({ loadMaps: true }))
      .pipe(markSouceMaps({ destBase: dest.base }))
  );

  gulp.task(
    'report',
    ['report-prepare'],
    () =>
      new Promise(() => {
        startServer({ destBase: dest.base });
      })
  );
};
