'use strict';
var path = require('path');
var chalk = require('chalk');
var util = require('util');
var ScriptBase = require('../script-base.js');
var angularUtils = require('../util.js');
var yeoman = require('yeoman-generator');

var RouteGenerator = ScriptBase.extend({
  constructor: function(name) {
    ScriptBase.apply(this, arguments);

    var bower = require(path.join(process.cwd(), 'bower.json'));
    var match = require('fs').readFileSync(
      path.join(this.env.options.appPath, 'scripts/app.js'), 'utf-8'
    ).match(/\.when/);

    if (
      bower.dependencies['angular-route'] ||
      bower.devDependencies['angular-route'] ||
      match !== null
    ) {
      this.foundWhenForRoute = true;
    }

    this.hookFor('angular-require:controller');
    this.hookFor('angular-require:view');
  },

  writing: {
    rewriteAppJs: function() {
      if (!this.foundWhenForRoute) {
        this.on('end', function () {
          this.log(chalk.yellow(
            '\nangular-route is not installed. Skipping adding the route to scripts/app.js'
          ));
        });

        return;
      }

      this.uri = this.name;
      if (this.options.uri) {
        this.uri = this.options.uri;
      }

      var config = {
        file: path.join(
          this.env.options.appPath,
          'scripts/app.js'),
        needle: '.otherwise',
        splicable: [
          "  templateUrl: 'views/" + this.name.toLowerCase() + ".html',",
          "  controller: '" + this.classedName + "Ctrl'"
        ]
      };

      config.splicable.unshift(".when('/" + this.uri + "', {");
      config.splicable.push("})");

      angularUtils.rewriteFile(config);
    }
  }
});

module.exports = RouteGenerator;
