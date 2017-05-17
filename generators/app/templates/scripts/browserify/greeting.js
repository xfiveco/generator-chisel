<% if (features.has_babel) { %>
const greeting = name => {
  const element = document.querySelector('.js-greeting');

  if (element) {
    element.innerHTML = name;
  }
};

export default greeting;<% } else { %>'use strict';
<% if (features.has_jquery) { %>
var $ = require('jquery');

var greeting = function (name) {
  var element = $('.js-greeting');

  if (element.length) {
    element.text(name);
  }
};
<% } else { %>
var greeting = function (name) {
  var element = document.querySelector('.js-greeting');

  if (element) {
    element.innerHTML = name;
  }
};
<% } %>
module.exports = greeting;<% } %>
