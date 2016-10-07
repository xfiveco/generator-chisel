'use strict';
var yeoman = require('yeoman-generator');
var plugins = require('./plugins.json');

var WpPluginsGenerator = yeoman.Base.extend({

  initializing: function() {
    this.configuration = this.config.get('config');
    if(!this.configuration) {
      this.log('You need to run this generator in a project directory.');
      process.exit();
    }
  },

  prompting: function() {
    var prompts = [
      {
        type: 'checkbox',
        name: 'plugins',
        message: 'Select optional plugins'
      }
    ];

    var choices = prompts[0].choices = [];

    Object.keys(plugins).forEach((id) => {
      choices.push({
        name: plugins[id],
        value: id
      })
    })

    var done = this.async();
    this.prompt(prompts).then((answers) => {
      this.prompts = answers;
      done();
    });
  },

  install: function() {
    if(!this.prompts.plugins.length)
      return;
    var done = this.async();
    var cb = (err) => {
      if(err)
        throw err;
      done();
    };
    this.spawnCommand('composer', ['require'].concat(this.prompts.plugins))
      .on('error', cb)
      .on('exit', cb);
  }

});

module.exports = WpPluginsGenerator;
