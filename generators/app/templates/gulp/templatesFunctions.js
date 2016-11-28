module.exports = function(data) {
  data = data || {};
  var functions = [
    {
      name: "assetPath",
      func: function (path) {
        if (data.manifest) {
          return data.manifest[path];
        } else {
          return path;
        }
      }
    }
  ];

  return functions;
}
