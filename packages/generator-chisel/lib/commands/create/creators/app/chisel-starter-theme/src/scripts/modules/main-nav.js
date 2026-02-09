class MainNav {
  /**
   * Delay before adding the 'open' class after 'active'.
   * This small delay ensures CSS transitions trigger properly.
   */
  static ANIMATION_START_DELAY = 10;

  /**
   * Duration to wait before cleanup after closing.
   * Should match the CSS transition duration for the nav items.
   */
  static TRANSITION_DURATION = 300;

  constructor() {
    this.initSelectors();
    this.initElements();

    if (!this.elements.nav) {
      return;
    }

    this.initClassnames();

    this.init();
  }

  initSelectors() {
    this.selectors = {
      nav: '.js-main-nav',
      navLink: '.js-main-nav-link',
      navItem: '.js-main-nav-item',
      navItems: '.js-main-nav__items',
      navToggle: '.js-main-nav-toggle',
    };
  }

  initElements() {
    this.elements = {
      nav: document.querySelector(this.selectors.nav),
      navLink: document.querySelectorAll(this.selectors.navLink),
      navItems: document.querySelector(this.selectors.navItems),
      navToggle: document.querySelector(this.selectors.navToggle),
    };
  }

  initClassnames() {
    this.classnames = {
      active: 'is-active',
      open: 'is-open',
      caret: 'is-caret',
      locked: 'is-locked',
    };
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.elements.navToggle.addEventListener('click', () => this.navToggleClickHandler());

    this.elements.navLink.forEach((link) =>
      link.addEventListener('click', (e) => this.navLinkClickHandler(e)),
    );
  }

  navLinkClickHandler(e) {
    if (e.target.classList.contains(this.classnames.caret)) {
      e.preventDefault();

      e.target.closest(this.selectors.navItem).classList.toggle(this.classnames.active);
    }
  }

  navToggleClickHandler() {
    this.elements.navToggle.classList.toggle(this.classnames.active);
    document.documentElement.classList.toggle(this.classnames.locked);

    if (this.elements.navToggle.classList.contains(this.classnames.active)) {
      this.elements.navItems.querySelector(this.selectors.navLink).focus();

      this.elements.navItems.classList.add(this.classnames.active);

      setTimeout(() => {
        this.elements.navItems.classList.add(this.classnames.open);
      }, MainNav.ANIMATION_START_DELAY);

      const coords = this.elements.navToggle.getBoundingClientRect();

      Object.assign(this.elements.navToggle.style, {
        top: `${coords.top}px`,
        right: `${document.body.clientWidth - coords.right}px`,
        position: 'fixed',
      });
    } else {
      this.elements.navItems.classList.remove(this.classnames.open);

      setTimeout(() => {
        this.elements.navItems.classList.remove(this.classnames.active);

        Object.assign(this.elements.navToggle.style, {
          top: 'auto',
          right: 'auto',
          position: 'relative',
        });
      }, MainNav.TRANSITION_DURATION);
    }
  }
}

export default MainNav;
