'use strict';

const wpCli = require('./wpCli');
const async = require('async');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const ACF_NAME = 'advanced-custom-fields-pro';
const ACFCLI_NAME = 'advanced-custom-fields-wpcli';
const ACFCLI_URL = 'https://github.com/hoppinger/advanced-custom-fields-wpcli/archive/master.zip';

const STDOUT = 0;

function _checkPlugins(generator, stdio, cb) {
  var plugins = JSON.parse(stdio[STDOUT]);
  var acf = _.find(plugins, (o) => o.name == ACF_NAME);
  var acfCli = _.find(plugins, (o) => o.name == ACFCLI_NAME);
  var problems = 0;

  if(!acf) {
    cb('No ACF installed so nothing to export :)');
    return;
  }
  if(acf.status != 'active') {
    generator.log('ACF is not active');
    problems++;
  }
  if(!acfCli) {
    generator.log('ACF WP-CLI is not installed');
    problems++;
  } else if(acfCli.status != 'active') {
    generator.log('ACF WP-CLI is not active');
    problems++;
  }
  cb(null, {problems, acf, acfCli});
}

function _askToFixProblems(generator, info, cb) {
  generator.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: 'Would you like us to try to fix above problem' + (info.problems > 1 ? 's' : '') + '?'
    }
  ]).then((answers) => {
    if(answers.continue) {
      cb(null, info)
    } else {
      cb('You decided to not continue');
    }
  });
}

function _fixProblems(generator, info, cb) {
  var acf = info.acf;
  var acfCli = info.acfCli;

  async.series([
    function(cb) {
      if(acf.status != 'active') {
        wpCli(['plugin', 'activate', ACF_NAME], cb);
      } else {
        cb();
      }
    },
    function(cb) {
      if(!acfCli) {
        wpCli(['plugin', 'install', ACFCLI_URL, {activate: true}], cb);
      } else if(acfCli.status != 'active') {
        wpCli(['plugin', 'activate', ACFCLI_NAME], cb);
      } else {
        cb();
      }
    },
  ], cb);
}

function _checkIfPathIsSet(generator, stdio, cb) {
  if(stdio[1].length) {
    generator.log(stdio[1].toString('utf8'));
  }
  var paths = JSON.parse(stdio[STDOUT]);
  if(!paths || !paths.length) {

    generator.log(`
You need to define path where exported JSON will be stored.
Please note that configuration must be added as a plugin not inside theme.
Example configuration:

${fs.readFileSync(
  path.join(__dirname, '../generators/wp-plugins/templates/acf-wp-cli-configuration.php')
)}
      `)

    cb('No ACF JSON path defined');
  }
  cb();
}

function runChecks(generator, cb) {
  async.waterfall([
    (cb) => wpCli(['plugin', 'list', {format: 'json'}], {hideStdio: true}, cb),
    (stdio, cb) => _checkPlugins(generator, stdio, cb),
    (info, cb) => info.problems ? _askToFixProblems(generator, info, cb) : cb(null, info),
    (info, cb) => info.problems ? _fixProblems(generator, info, cb) : cb(null, info),
    (info, cb) =>
      wpCli(
        ['eval', 'echo json_encode(apply_filters(\'acfwpcli_fieldgroup_paths\', []));'],
        {hideStdio: true},
        cb
      ),
    (stdio, cb) => _checkIfPathIsSet(generator, stdio, cb),
  ], cb);
}

module.exports.runChecks = runChecks;
