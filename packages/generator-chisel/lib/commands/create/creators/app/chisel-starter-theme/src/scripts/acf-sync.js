class XfiveACFSync {
  constructor() {
    this.modal = document.querySelector('.js-xfive-acf-sync-modal');

    if (!this.modal) {
      return;
    }

    this.classnames = {
      open: 'is-open',
    };

    this.modalCloseButton = document.querySelector('.js-xfive-acf-sync-modal-close');

    this.modalCloseHandler();
  }

  modalCloseHandler() {
    this.modalCloseButton.addEventListener('click', () => {
      this.modal.classList.remove(this.classnames.open);
    });
  }
}

// eslint-disable-next-line no-new
new XfiveACFSync();
