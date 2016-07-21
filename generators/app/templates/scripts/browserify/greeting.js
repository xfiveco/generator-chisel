'use strict';

var $ = require('jquery');

var greeting = function (name) {
  $('.js-greeting').text(` ${name}, nice to see you, too!`);
};

module.exports = greeting;
