'use strict';<% if (features.has_jquery) { %>

var $ = require('jquery');<% } %>

var greeting = function (name) {<% if (features.has_jquery) { %>
  var element = $('.js-greeting');<% } else { %>
  var element = document.querySelector('.js-greeting');<% } %>
<% if (features.has_jquery) { %>
  if (element.length) {
    element.text(name);
  }<% } else { %>
  if (element) {
    element.innerHTML = name;
  }<% } %>
};

module.exports = greeting;
