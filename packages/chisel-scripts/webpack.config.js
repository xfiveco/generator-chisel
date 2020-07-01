const Service = require('./lib/Service');

const service = new Service();

module.exports = (async () => {
  await service.init();

  return service.resolveWebpackConfig();
})();
