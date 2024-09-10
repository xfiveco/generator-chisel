import Utils from './utils';

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
    const { postType, perPage, maxPage } = this.elements.loadMore.dataset;

    this.state = {
      page: 2,
      loading: false,
      postType,
      perPage,
      maxPage,
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
    };
  }

  initClassnames() {
    this.classnames = {
      loading: 'is-loading',
    };
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.elements.loadMoreButton.addEventListener('click', () => this.loadMore());
  }

  loadMore() {
    if (this.state.loading) {
      return;
    }

    this.setState({ loading: true });
    this.elements.loadMoreButton.classList.add(this.classnames.loading);

    Utils.ajaxRequest('load-more', {
      page: this.state.page,
      post_type: this.state.postType,
      per_page: this.state.perPage,
      max_page: this.state.maxPage,
    }).then((response) => {
      this.elements.loadMoreButton.classList.remove(this.classnames.loading);
      this.elements.container.insertAdjacentHTML('beforeend', response.data);

      if (this.state.page >= parseFloat(this.state.maxPage)) {
        this.elements.loadMore.remove();
      } else {
        this.setState({ page: this.state.page + 1, loading: false });
      }
    });
  }
}

export default LoadMore;
