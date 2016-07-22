'use strict';

var greeting = function (name) {
  document.querySelector('.js-greeting').innerHTML = name;
};

module.exports = greeting;
