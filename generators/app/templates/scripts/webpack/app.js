/*
  Project: <%= name %>
  Author: <%= author %>
 */
<% if (features.has_babel) { %>
import greet from './modules/greeting';<% } else { %>
var greet = require('./modules/greeting.js');<% } %>

greet('World');
