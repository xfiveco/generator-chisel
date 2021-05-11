class onPageNavigation {
  constructor() {
    if (!this.setVars()) return;

    this.setEvents();
  }

  setVars() {
    this.BREAKPOINT = 1023;

    this.atts = {
      activeClass: 'c-page-sidebar__link--active',
      selectedClass: 'c-page-sidebar__link--selected',
      activeOffset: 100, // Sets how early activate the item
    };

    this.sidebar = document.querySelector('.c-page-sidebar');
    this.article = document.querySelector('.c-post__article');

    if (!this.sidebar || !this.article) return false;

    this.links = this.sidebar.querySelectorAll('a');
    this.titles = this.article.querySelectorAll('h2');
    this.titleBoundings = this.setBoundings();
    this.activeLink = null;
    this.selectedLink = null;

    return true;
  }

  setEvents() {
    window.addEventListener('scroll', () => {
      if (window.innerWidth > this.BREAKPOINT) {
        this.onScroll();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > this.BREAKPOINT) {
        this.titleBoundings = this.setBoundings();
      }
    });

    this.links.forEach((link) => {
      if (window.innerWidth > this.BREAKPOINT) {
        link.addEventListener('click', () => this.setSelectedLink(link));
      }
    });
  }

  setSelectedLink(link) {
    const { selectedClass } = this.atts;

    if (this.selectedLink) {
      this.selectedLink.classList.remove(selectedClass);
    }

    link.classList.add(selectedClass);
    this.selectedLink = link;
  }

  onScroll() {
    const { activeClass } = this.atts;

    if (
      this.titleBoundings[0] > window.pageYOffset &&
      this.links[0].classList.contains(activeClass)
    ) {
      this.links[0].classList.remove(activeClass);
      this.activeLink = null;
    }

    for (let idx = 0; idx < this.titleBoundings.length; idx += 1) {
      const offset = this.titleBoundings[idx];

      const nextOffset = this.titleBoundings[idx + 1]
        ? this.titleBoundings[idx + 1]
        : document.body.scrollHeight;

      if (
        window.pageYOffset >= offset &&
        window.pageYOffset < nextOffset &&
        this.activeLink !== this.links[idx]
      ) {
        if (this.activeLink) {
          this.activeLink.classList.remove(activeClass);
        }

        this.links[idx].classList.add(activeClass);
        this.activeLink = this.links[idx];
        break;
      }
    }
  }

  setBoundings() {
    return Array.from(this.titles).map((title) => {
      return this.getOffsetTop(title);
    });
  }

  getOffsetTop(element) {
    const { activeOffset } = this.atts;
    let offsetTop = 0;
    let tmpElement = element;
    while (tmpElement) {
      offsetTop += tmpElement.offsetTop;
      tmpElement = tmpElement.offsetParent;
    }
    offsetTop -= activeOffset;
    return offsetTop;
  }
}

export default onPageNavigation;
