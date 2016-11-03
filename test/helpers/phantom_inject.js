(function() {
  var element = null;

  var observerNewNode = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if(!mutation.addedNodes.length) {
        return;
      }
      var addedNode = mutation.addedNodes[0];
      if(addedNode.id == '__bs_notify__') {
        window.callPhantom({kind: 'bsNotify', text: addedNode.textContent.trim()})
        element = addedNode;
        observerText.observe(element, {characterData: true, subtree: true});
        observerNewNode.disconnect();
      };
    })
  })

  var observerText = new MutationObserver(function(mutations) {
    var parent = mutations[0].target.parentNode;
    if(parent.id != '__bs_notify__') {
      return;
    }
    window.callPhantom({kind: 'bsNotify', text: parent.textContent.trim()});
  })

  observerNewNode.observe(document.body, {childList: true});

  window.addEventListener('load', function() {
    window.callPhantom({kind: 'loadedInside'});
  })

  if(!window.callPhantom) {
    window.callPhantom = console.log.bind(console);
  }
  window.callPhantom({kind: 'hello'});
})();
