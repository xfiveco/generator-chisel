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
    }
  ];

  return functions;
}
