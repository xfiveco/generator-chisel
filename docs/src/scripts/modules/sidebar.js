class Sidebar {
  constructor() {
    if (!this.setVars()) return;

    this.setEvents();
  }

  setVars() {
    this.atts = {
      activeClass: 'c-sidebar--active',
    };

    this.section = document.querySelector('.js-sidebar');

    if (!this.section) return false;

    this.mainElements = document.querySelectorAll(
      'article, .c-sidebar--this-page, header, footer',
    );
    this.button = this.section.querySelector('.js-toggle');
    this.content = this.section.querySelector('.c-siderbar__content');

    return true;
  }

  setEvents() {
    window.addEventListener('DOMContentLoaded', () => {
      if (window.innerWidth < 1024) {
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
      this.section.classList.remove(activeClass);
      this.section.setAttribute('inert', 'true');
      this.setInert(false);
    } else {
      this.section.classList.add(activeClass);
      this.section.removeAttribute('inert', 'true');
      this.setInert();
    }
  }

  setInert(isActive = true) {
    this.mainElements.forEach((element) =>
      isActive
        ? element.setAttribute('inert', 'true')
        : element.removeAttribute('inert'),
    );
  }
}

export default Sidebar;
