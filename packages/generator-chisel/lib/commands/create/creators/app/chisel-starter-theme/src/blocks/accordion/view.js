class Accordion {
  constructor(accordion) {
    this.accordion = accordion;

    this.initSelectors();
    this.initElements();
    this.initClassNames();

    this.opening = {
      item: null,
      animation: null,
    };
    this.closing = {
      item: null,
      animation: null,
    };

    this.settings = {
      closeOthers: this.accordion.classList.contains(this.classNames.closeOthers),
      firstOpen: this.accordion.classList.contains(this.classNames.firstOpen),
    };

    this.firstOpenhandler();
    this.toggleItems();
  }

  initSelectors() {
    this.selectors = {
      items: '.js-accordion-item',
      header: '.js-accordion-header',
      content: '.js-accordion-content',
    };
  }

  initElements() {
    this.elements = {
      items: this.accordion.querySelectorAll(this.selectors.items),
    };
  }

  initClassNames() {
    this.classNames = {
      open: 'is-open',
      firstOpen: 'has-first-open',
      closeOthers: 'has-close-others',
    };
  }

  firstOpenhandler() {
    if (!this.settings.firstOpen) {
      return;
    }

    if (this.elements.items.length) {
      this.opening.item = this.elements.items[0];
      this.openItemHandler();
    }
  }

  openItemHandler() {
    this.opening.item.style.overflow = 'hidden';
    this.opening.item.style.height = `${this.opening.item.offsetHeight}px`;
    this.opening.item.open = true;

    window.requestAnimationFrame(() => {
      const startHeight = `${this.opening.item.offsetHeight}px`;
      const content = this.opening.item.querySelector(this.selectors.content);
      const header = this.opening.item.querySelector(this.selectors.header);

      const endHeight = `${header.offsetHeight + content.offsetHeight}px`;

      if (this.opening.animation) {
        this.opening.animation.cancel();
      }

      this.animate(this.opening, startHeight, endHeight, true);
    });
  }

  animate = (animateObject, startHeight, endHeight, finishOpen) => {
    animateObject.animation = animateObject.item.animate(
      {
        // Set the keyframes from the startHeight to endHeight
        height: [startHeight, endHeight],
      },
      {
        duration: 200,
        easing: 'linear',
      },
    );

    animateObject.animation.onfinish = () => this.onAnmationEnd(animateObject, finishOpen);
  };

  closeItemHandler() {
    const header = this.closing.item.querySelector(this.selectors.header);
    const startHeight = `${this.closing.item.offsetHeight}px`;
    const endHeight = `${header.offsetHeight}px`;

    if (this.closing.animation) {
      this.closing.animation.cancel();
    }

    this.animate(this.closing, startHeight, endHeight, false);
  }

  onAnmationEnd = (animateObject, open) => {
    animateObject.item.open = open;
    animateObject.item.style.overflow = '';
    animateObject.item.style.height = '';
    animateObject.animation = null;
  };

  toggleItems() {
    this.elements.items.forEach((accordionItem) => {
      accordionItem.addEventListener('click', (e) => {
        e.preventDefault();

        if (this.settings.closeOthers && this.opening.item) {
          this.closing.item = this.opening.item;
          this.closeItemHandler();
        }

        if (!accordionItem.open) {
          this.opening.item = accordionItem;
          this.openItemHandler();
        } else {
          this.closing.item = accordionItem;
          this.closeItemHandler();
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.js-accordion');

  if (!accordions.length) {
    return;
  }

  accordions.forEach((accordion) => {
    new Accordion(accordion);
  });
});
