#!/usr/bin/env node

const Service = require('../lib/Service');

const service = new Service();
service.run(process.argv[2], process.argv.slice(3)).catch((err) => {
  console.error(err);
  process.exit(1);
});
