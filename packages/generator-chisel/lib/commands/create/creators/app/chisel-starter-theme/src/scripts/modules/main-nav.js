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

  /**
   * Elements that can hold focus inside the open mobile overlay.
   */
  static FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
      navCaret: '.js-main-nav-caret',
      navItem: '.js-main-nav-item',
      navItems: '.js-main-nav__items',
      navToggle: '.js-main-nav-toggle',
    };
  }

  initElements() {
    this.elements = {
      nav: document.querySelector(this.selectors.nav),
      navCaret: document.querySelectorAll(this.selectors.navCaret),
      navItems: document.querySelector(this.selectors.navItems),
      navToggle: document.querySelector(this.selectors.navToggle),
    };
  }

  initClassnames() {
    this.classnames = {
      active: 'is-active',
      open: 'is-open',
      locked: 'is-locked',
    };
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.elements.navToggle.addEventListener('click', () => this.navToggleClickHandler());

    this.elements.navCaret.forEach((caret) =>
      caret.addEventListener('click', (e) => this.navCaretClickHandler(e)),
    );

    this.elements.nav.addEventListener('keydown', (e) => this.navKeydownHandler(e));
  }

  isNavOpen() {
    return this.elements.navToggle.classList.contains(this.classnames.active);
  }

  navKeydownHandler(e) {
    if (!this.isNavOpen()) {
      return;
    }

    if (e.key === 'Escape') {
      this.navToggleClickHandler();
      this.elements.navToggle.focus();

      return;
    }

    if (e.key === 'Tab') {
      this.trapFocus(e);
    }
  }

  /**
   * Keep Tab inside the open overlay. The toggle sits outside the list but stays
   * on top of it, so it is the first stop in the cycle.
   */
  trapFocus(e) {
    const focusable = [
      this.elements.navToggle,
      ...this.elements.navItems.querySelectorAll(MainNav.FOCUSABLE_SELECTOR),
    ].filter((el) => el === this.elements.navToggle || el.offsetParent !== null);

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  navCaretClickHandler(e) {
    const caret = e.currentTarget;
    const item = caret.closest(this.selectors.navItem);

    if (!item) {
      return;
    }

    const isActive = item.classList.toggle(this.classnames.active);

    caret.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  }

  navToggleClickHandler() {
    const isActive = this.elements.navToggle.classList.toggle(this.classnames.active);

    document.documentElement.classList.toggle(this.classnames.locked);
    this.elements.navToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');

    if (isActive) {
      this.elements.navItems.classList.add(this.classnames.active);

      setTimeout(() => {
        this.elements.navItems.classList.add(this.classnames.open);

        // Focus only once the list is visible - `visibility: hidden` elements cannot take focus.
        this.elements.navItems.querySelector(this.selectors.navLink)?.focus();
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
