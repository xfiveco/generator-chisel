var system = require('system');
var args = system.args;

var page = require('webpage').create();

page.onCallback = function(data) {
  show(data);
}

page.onUrlChanged = function(url) {
  show({kind: 'urlChanged', url: url})
}

page.onConsoleMessage = function(a, b, c) {
  console.log('console', a, b, c);
}

page.onError = function(a, b) {
  console.log('error', a, b);
}

page.open(args[1], function(success) {
  show({kind: 'loaded', success: success});
});

function show(data) {
  console.log(JSON.stringify(data));
}
