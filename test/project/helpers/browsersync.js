exports.waitFor = page => {
  return new Promise((resolve) => {
    page.once('bsConnected', resolve);
  });
}

exports.monitor = page => {
  let previousMessage = '';
  let isWaitingForClose = false;

  function wait() {
    page
      .waitForSelector('#__bs_notify__')
      .then(() => {
        wait();
        if(!isWaitingForClose) {
          isWaitingForClose = true;
          page
            .waitForSelector('#__bs_notify__', { hidden: true })
            .then(() => {
              previousMessage = '';
              isWaitingForClose = false;
            })
            .catch(() => {});
        }
        return page.$('#__bs_notify__');
      })
      .then(el => el.getProperty('textContent'))
      .then(val => val.jsonValue())
      .then(str => {
        if(previousMessage === str) {
          return;
        }
        previousMessage = str;
        process.nextTick(() => page.emit('bsNotify', str));
        if(str == 'Browsersync: connected') {
          process.nextTick(() => page.emit('bsConnected'));
        }
      })
      .catch(() => {});
  }
  wait();

  page.on('framenavigated', () => {
    process.nextTick(() => page.emit('chiselNavigated'));
  });
}
