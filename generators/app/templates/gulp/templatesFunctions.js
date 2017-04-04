var pathModule = require('path');

module.exports = function(data) {
  data = data || {};
  var functions = [
    {
      name: 'revisionedPath',
      func: function (fullPath) {
        var path = pathModule.basename(fullPath);
        if (data.manifest) {
          if(!data.manifest[path]) {
            throw new Error('File '+path+' seems to not be revisioned');
          }
          return pathModule.join(pathModule.dirname(fullPath),
            data.manifest[path]);
        } else {
          return fullPath;
        }
      }
    },
    {
      name: 'assetPath',
      func: function (path) {
        return pathModule.join(data.config.dest.assets, path);
      }
    },
    {
      name: 'className',
      func: function () {
        var args = Array.prototype.slice.call(arguments);
        var name = args.shift();
        if(typeof name != 'string' || name == '') {
          return '';
        }
        var classes = [name];
        var el;
        for(var i = 0; i < args.length; i++) {
          el = args[i];
          if(el && typeof el == 'string') {
            classes.push(name + '--' + el);
          }
        }
        return classes.join(' ');
      }
    }
  ];

  return functions;
}
