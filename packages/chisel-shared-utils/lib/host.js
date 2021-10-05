// Inspired by https://github.com/webpack/webpack-dev-server/blob/d4282dc2f6858b2768658fbc091660bdd704cb05/lib/Server.js#L64
module.exports.host = async function host(hostname) {
  if (hostname !== '0.0.0.0') return hostname;

  const internalIp = require('internal-ip');
  return (await internalIp.v4()) || '0.0.0.0';
};
