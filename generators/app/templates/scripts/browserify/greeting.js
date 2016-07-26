'use strict';<% if (features.has_jquery) { %>

var $ = require('jquery');<% } %>

var greeting = function (name) {<% if (features.has_jquery) { %>
  $('.js-greeting').text(name);<% } else { %>
  document.querySelector('.js-greeting').innerHTML = name;<% } %>
};

module.exports = greeting;
