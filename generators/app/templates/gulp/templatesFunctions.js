var pathModule = require('path');

module.exports = function(data) {
  data = data || {};
  var functions = [
    {
      name: "revisionedPath",
      func: function (path) {
        if (data.manifest) {
          if(!data.manifest[path]) {
            throw new Error('File '+path+' seems to not be revisioned');
          }
          return data.manifest[path];
        } else {
          return path;
        }
      }
    },
    {
      name: 'assetPath',
      func: function (path) {
        return pathModule.join(data.config.dest.assets, path);
      }
    }
  ];

  return functions;
}
