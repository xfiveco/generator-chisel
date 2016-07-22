'use strict';

var $ = require('jquery');

var greeting = function (name) {
  $('.js-greeting').text(name);
};

module.exports = greeting;
