/*
  Project: <%= name %>
  Author: <%= author %>
 */
<% if (features.has_babel) { %>
import { greeting as greet } from './greeting';<% } else { %>
var greet = require('./greeting.js')
<% } %>

greet('World');
