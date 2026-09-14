/* global chiselScripts */

import Utils from './utils';

const i18n = (key, fallback) => chiselScripts?.i18n?.[key] ?? fallback;

class LoadMore {
  constructor() {
    this.initSelectors();
    this.initElements();

    if (!this.elements.loadMore) {
      return;
    }

    this.initClassnames();
    this.initState();

    this.init();
  }

  initState() {
    const { postType, perPage, maxPage, search, query } = this.elements.loadMore.dataset;

    this.state = {
      page: 2,
      loading: false,
      postType,
      perPage,
      maxPage,
      search,
      // Archive scope (author, taxonomy + term, or date parts) - forwarded as-is,
      // the endpoint validates every key.
      query: query ? JSON.parse(query) : {},
    };
  }

  setState(newState) {
    this.state = {
      ...this.state,
      ...newState,
    };
  }

  initSelectors() {
    this.selectors = {
      container: '.js-load-more-container',
      loadMore: '.js-load-more',
      loadMoreButton: '.js-load-more-button',
    };
  }

  initElements() {
    this.elements = {
      container: document.querySelector(this.selectors.container),
      loadMore: document.querySelector(this.selectors.loadMore),
      loadMoreButton: document.querySelector(this.selectors.loadMoreButton),
      status: null,
    };
  }

  initClassnames() {
    this.classnames = {
      loading: 'is-loading',
    };
  }

  init() {
    this.elements.status = this.createStatusRegion();

    this.bindEvents();
  }

  bindEvents() {
    this.elements.loadMoreButton.addEventListener('click', () => this.loadMore());
  }

  /*
   * Create the live region used to announce loaded items. It sits outside the
   * load-more wrapper so it survives that wrapper being removed on the last page.
   */
  createStatusRegion() {
    const region = document.createElement('div');

    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.className = 'u-sr-only';

    this.elements.container.insertAdjacentElement('afterend', region);

    return region;
  }

  setLoading(loading) {
    const button = this.elements.loadMoreButton;

    this.setState({ loading });

    button.classList.toggle(this.classnames.loading, loading);
    button.disabled = loading;
    button.setAttribute('aria-busy', loading ? 'true' : 'false');
  }

  announce(added, isLastPage) {
    const messages = [];

    if (added > 0) {
      messages.push(i18n('itemsLoaded', '%d more items loaded.').replace('%d', added));
    }

    if (isLastPage) {
      messages.push(i18n('allItemsLoaded', 'All items loaded.'));
    }

    this.elements.status.textContent = messages.join(' ');
  }

  /*
   * Move focus to the first item that was just added. Only used on the last page,
   * where the button the visitor was on is about to be removed.
   *
   * @param {number} index - Number of items present before the insert.
   */
  focusFirstNewItem(index) {
    const firstNew = this.elements.container.children[index];

    if (!firstNew) {
      return;
    }

    firstNew.setAttribute('tabindex', '-1');
    firstNew.focus({ preventScroll: true });
  }

  loadMore() {
    if (this.state.loading) {
      return;
    }

    this.setLoading(true);

    const loadedBefore = this.elements.container.children.length;

    Utils.ajaxRequest('load-more', {
      page: this.state.page,
      post_type: this.state.postType,
      per_page: this.state.perPage,
      max_page: this.state.maxPage,
      ...this.state.query,
      ...(this.state.search ? { s: this.state.search } : {}),
    })
      .then((response) => {
        // The endpoint answers 200 even when it refuses the request, so the flag is
        // the only signal - without this `response.data` is undefined and the string
        // "undefined" gets appended to the grid.
        if (response.error) {
          throw new Error(response.message);
        }

        this.elements.container.insertAdjacentHTML('beforeend', response.data);

        const added = this.elements.container.children.length - loadedBefore;

        // Nothing came back - the archive is exhausted, whatever the reported page count.
        const isLastPage = added === 0 || this.state.page >= parseFloat(this.state.maxPage);

        this.announce(added, isLastPage);

        if (isLastPage) {
          this.focusFirstNewItem(loadedBefore);
          this.elements.loadMore.remove();
        } else {
          this.setLoading(false);
          this.setState({ page: this.state.page + 1 });
        }
      })
      .catch(() => {
        this.setLoading(false);
        this.elements.status.textContent = i18n('loadMoreError', 'Could not load more items.');
      });
  }
}

export default LoadMore;
