class Sidebar {
  constructor() {
    if (!this.setVars()) return;

    this.setEvents();
  }

  setVars() {
    this.NOT_ACTIVE = false;
    this.BREAKPOINT = 1023;

    this.atts = {
      activeClass: 'c-sidebar--active',
      noScroll: 'no-scroll',
    };

    this.section = document.querySelector('.js-sidebar');

    if (!this.section) return false;

    this.mainElements = document.querySelectorAll(
      'article, .c-page-sidebar, header, footer',
    );
    this.button = this.section.querySelector('.js-toggle');
    this.content = this.section.querySelector('.c-siderbar__content');

    return true;
  }

  setEvents() {
    window.addEventListener('DOMContentLoaded', () => {
      if (window.innerWidth <= this.BREAKPOINT) {
        this.section.setAttribute('inert', 'true');
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > this.BREAKPOINT) {
        this.destroySidebar();
      } else {
        this.section.setAttribute('inert', 'true');
      }
    });

    this.button.addEventListener('click', () => {
      this.toggleSidebar();
    });
  }

  toggleSidebar() {
    const { activeClass } = this.atts;

    if (this.section.classList.contains(activeClass)) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    const { activeClass } = this.atts;

    this.section.classList.add(activeClass);
    this.section.removeAttribute('inert');
    this.disableDocumentScroll();
    this.setInert();
  }

  closeSidebar() {
    const { activeClass } = this.atts;

    this.section.classList.remove(activeClass);
    this.section.setAttribute('inert', 'true');
    this.enableDocumentScroll();
    this.setInert(this.NOT_ACTIVE);
  }

  destroySidebar() {
    const { activeClass } = this.atts;

    this.section.classList.remove(activeClass);
    this.section.removeAttribute('inert');
    this.enableDocumentScroll();
    this.setInert(this.NOT_ACTIVE);
  }

  setInert(isActive = true) {
    this.mainElements.forEach((element) =>
      isActive
        ? element.setAttribute('inert', 'true')
        : element.removeAttribute('inert'),
    );
  }

  disableDocumentScroll() {
    const { noScroll } = this.atts;

    if (document.documentElement.classList.contains(noScroll)) return;

    document.documentElement.classList.add(noScroll);
  }

  enableDocumentScroll() {
    const { noScroll } = this.atts;

    if (!document.documentElement.classList.contains(noScroll)) return;

    document.documentElement.classList.remove(noScroll);
  }
}

export default Sidebar;
