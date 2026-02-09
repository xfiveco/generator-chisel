import { __ } from '@wordpress/i18n';

class Slider {
  constructor(slider, swiper, swiperModules) {
    this.slider = slider;
    this.swiper = swiper.Swiper;
    this.swiperModules = swiperModules;

    this.swipers = [];
    this.use = [];
    this.params = {};

    this.initSelectors();
    this.initElements();
    this.initClassNames();

    this.setParams();

    this.swiper.use(this.use);

    const swiperInstance = new this.swiper(this.elements.slider, this.params);
    this.swipers.push(swiperInstance);

    this.initAccessibility();
  }

  /*
   * Initialize selectors.
   */
  initSelectors() {
    this.selectors = {
      sliderContainer: '.js-slider-container',
      slider: '.js-slider',
      slide: '.swiper-slide',
      navigationPrev: '.swiper-button-prev',
      navigationNext: '.swiper-button-next',
      scrollbar: '.swiper-scrollbar',
    };
  }

  /*
   * Initialize elements.
   */
  initElements() {
    this.elements = {
      sliderContainer: this.slider.parentElement,
      slider: this.slider,
      navigationWrapper: null,
      navigation: null,
      navigationButtonPrev: null,
      navigationButtonNext: null,
      paginationWrapper: null,
      pagination: null,
      scrollbar: null,
    };
  }

  /*
   * Initialize class names.
   */
  initClassNames() {
    this.classNames = {
      swiper: 'swiper',
      slider: 'c-slider',
      navigationWrapper: 'swiper-navigation-wrapper',
      navigation: 'swiper-navigation',
      navigationButton: 'swiper-button',
      navigationPrev: 'swiper-button-prev',
      navigationNext: 'swiper-button-next',
      paginationWrapper: 'swiper-pagination-wrapper',
      pagination: 'swiper-pagination',
      scrollbar: 'swiper-scrollbar',
      thumbs: 'swiper-thumbs',
      sliderThumbs: 'c-slider__thumbs',
    };
  }

  /*
   * Set swiper params based on data attributes or default values.
   */
  setParams() {
    // Custom params from which swiper params are created.
    const {
      type = 'default',
      arrows = 'no',
      autoplay = 'no',
      autoplayTimeout = '5000',
      autoHeight = 'no',
      center = 'no',
      direction = 'horizontal',
      dots = 'no',
      // dotsDynamic = '0',
      effect = 'slide', // Can be 'slide', 'fade', 'cube', 'coverflow', 'flip', 'creative' or 'cards'.
      freeMode = 'no',
      initialSlide = '0',
      loop = 'no',
      parallax = 'no',
      slidesPerView = '1',
      spaceBetween = '10',
      speed = '1000',
      scrollbar = 'no',
      thumbnails = '0', // enables thumbnails and sets to specified number of items.
    } = this.slider.dataset;

    // Swiper params (names as per docs).
    const { breakpoints = null, args = null } = this.slider.dataset;

    // Initialize params for the swiper.
    let params = {
      autoHeight: autoHeight === 'yes',
      centeredSlides: center === 'yes',
      direction,
      effect,
      freeMode,
      initialSlide,
      loop: loop === 'yes',
      parallax: parallax === 'yes',
      slidesPerView,
      spaceBetween,
      speed,
      watchSlidesProgress: true,
    };

    this.params = params;

    // Enable thumbnails.
    if (thumbnails !== '0') {
      this.createThumbnails();
    }

    // Enable autoplay.
    if (autoplay === 'yes') {
      this.use.push(this.swiperModules.Autoplay);
      this.params.autoplay = {
        delay: autoplayTimeout < 1000 ? 1000 : autoplayTimeout,
        disableOnInteraction: false,
      };
    }

    // Enable scrollbar.
    if (scrollbar === 'yes') {
      this.createScrollbar();
    }

    // Enable arrows navigation.
    if (arrows === 'yes') {
      this.createArrowsNavigation();
    }

    // Enable dots pagination.
    if (dots === 'yes') {
      this.createPagination();
    }

    // Set breakpoints from data attributes.
    if (breakpoints) {
      this.params.breakpoints = JSON.parse(breakpoints);
    }

    // Set args from data attributes. This method can override any previous params.
    if (args) {
      this.params = { ...this.params, ...JSON.parse(args) };
    }

    // Set slider type params.
    this.setSliderTypeParams(type);
  }

  /*
   * Trigger slider type specific callback to set its own params.
   *
   * @param {string} type - Slider type.
   */
  setSliderTypeParams(type) {
    const typeCallback = `${type}SliderParams`;

    if (typeof this[typeCallback] === 'function') {
      this[typeCallback]();
    }
  }

  /*
   * Set default slider params. This params will only apply to default slider type.
   */
  defaultSliderParams() {
    this.params = {
      ...this.params,
      spaceBetween: 0,
    };
  }

  /*
   * Create and initialize arrows navigation.
   */
  createArrowsNavigation() {
    const wrapper = Object.assign(document.createElement('div'), {
      className: this.classNames.navigationWrapper,
    });

    const navigation = Object.assign(document.createElement('div'), {
      className: this.classNames.navigation,
    });

    const navigationButtonPrev = Object.assign(document.createElement('button'), {
      type: 'button',
      className: `${this.classNames.navigationButton} ${this.classNames.navigationPrev}`,
      ariaLabel: __('Previous slide', 'chisel'),
    });

    const navigationButtonNext = Object.assign(document.createElement('button'), {
      type: 'button',
      className: `${this.classNames.navigationButton} ${this.classNames.navigationNext}`,
      ariaLabel: __('Next slide', 'chisel'),
    });

    this.elements.slider.appendChild(wrapper);

    navigation.appendChild(navigationButtonPrev);
    navigation.appendChild(navigationButtonNext);

    wrapper.appendChild(navigation);

    this.elements.navigationWrapper = wrapper;
    this.elements.navigation = navigation;
    this.elements.navigationButtonPrev = navigationButtonPrev;
    this.elements.navigationButtonNext = navigationButtonNext;

    this.use.push(this.swiperModules.Navigation);

    this.params.navigation = {
      nextEl: this.selectors.navigationNext,
      prevEl: this.selectors.navigationPrev,
    };
  }

  /*
   * Create and initialize pagination.
   */
  createPagination() {
    const wrapper = Object.assign(document.createElement('div'), {
      className: this.classNames.paginationWrapper,
    });

    const pagination = Object.assign(document.createElement('div'), {
      className: this.classNames.pagination,
    });

    this.elements.slider.appendChild(wrapper);
    wrapper.appendChild(pagination);

    this.elements.paginationWrapper = wrapper;
    this.elements.pagination = pagination;

    this.use.push(this.swiperModules.Pagination);

    this.params.pagination = {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    };

    const { dotsDynamic } = this.slider.dataset;

    if (dotsDynamic !== undefined && dotsDynamic !== '0') {
      this.params.pagination = {
        ...this.params.pagination,
        dynamicBullets: true,
        dynamicMainBullets: parseFloat(dotsDynamic),
      };
    }
  }

  /*
   * Create and initialize scrollbar.
   */
  createScrollbar() {
    const scrollbar = Object.assign(document.createElement('div'), {
      className: this.classNames.scrollbar,
    });

    this.elements.slider.appendChild(scrollbar);

    this.elements.scrollbar = scrollbar;

    this.use.push(this.swiperModules.Scrollbar);

    this.params.scrollbar = {
      el: this.selectors.scrollbar,
      draggable: true,
    };
  }

  /*
   * Create and initialize thumbnails slider.
   */
  createThumbnails() {
    const thumbsSlider = this.elements.slider.cloneNode(true);

    thumbsSlider.removeAttribute('class');
    thumbsSlider.classList.add(
      this.classNames.swiper,
      this.classNames.thumbs,
      this.classNames.slider,
      this.classNames.sliderThumbs,
    );

    const slides = thumbsSlider.querySelectorAll(this.selectors.slide);

    slides.forEach((slide) => {
      const { thumbnailUrl } = slide.dataset;
      const slideImg = slide.querySelector('img');

      ['src', 'srcset', 'sizes', 'width', 'height'].forEach((attr) => {
        slideImg.removeAttribute(attr);
      });

      if (!thumbnailUrl) {
        throw new Error(
          'data-thumbnail-url attribute must be present on each swiper-slide element.',
        );
      }

      const imageSize = thumbnailUrl.match(/(\d+)x(\d+)\./i);

      if (imageSize?.[2]) {
        slideImg.setAttribute('width', imageSize[1]);
        slideImg.setAttribute('height', imageSize[2]);
      }
      slideImg.setAttribute('src', thumbnailUrl);
    });

    this.elements.sliderContainer.appendChild(thumbsSlider);

    // Remove data attributes from thumbs slider that were cloned from parent slider.
    // eslint-disable-next-line no-unused-vars
    Object.entries(thumbsSlider.dataset).forEach(([key, value]) => {
      delete thumbsSlider.dataset[key];
    });

    const {
      thumbnails,
      thumbsSliderParams = null,
      thumbsModuleParams = null,
    } = this.slider.dataset;

    let params = {
      loop: true,
      spaceBetween: 10,
      slidesPerView: thumbnails,
      freeMode: false,
      navigation: false,
      watchSlidesProgress: true,
    };

    if (thumbsSliderParams) {
      params = { ...params, ...JSON.parse(thumbsSliderParams) };
    }

    const thumbsSliderInstance = new this.swiper(thumbsSlider, params);

    let moduleParams = {
      swiper: thumbsSliderInstance,
      autoScrollOffset: 0,
    };

    if (thumbsModuleParams) {
      moduleParams = { ...moduleParams, ...JSON.parse(thumbsModuleParams) };
    }

    this.use.push(this.swiperModules.Thumbs);

    this.params.thumbs = moduleParams;
  }

  /**
   * Initialize accessibility features for screen readers.
   * Creates an aria-live region that announces slide changes.
   */
  initAccessibility() {
    if (this.swipers.length === 0) {
      return;
    }

    const mainSwiper = this.swipers[0];
    this.elements.liveRegion = this.createLiveRegion();

    mainSwiper.on('slideChange', () => {
      const currentSlide = mainSwiper.realIndex + 1;
      const totalSlides = mainSwiper.slides.length;
      this.elements.liveRegion.textContent = __('Slide %1$d of %2$d', 'chisel')
        .replace('%1$d', currentSlide)
        .replace('%2$d', totalSlides);
    });
  }

  /**
   * Create an aria-live region for announcing slide changes.
   */
  createLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'u-sr-only';
    this.elements.sliderContainer.appendChild(liveRegion);

    return liveRegion;
  }
}

export default () => {
  const sliders = document.querySelectorAll('.js-slider');

  if (!sliders.length) {
    return;
  }

  const loadModules = async () => {
    const [swiper, swiperModules, style] = await Promise.all([
      import('swiper'),
      import('swiper/modules'),
      import('swiper/swiper-bundle.css'),
    ]);

    return {
      swiper,
      swiperModules,
      style,
    };
  };

  loadModules()
    .then(({ swiper, swiperModules }) => {
      sliders.forEach((slider) => {
        new Slider(slider, swiper, swiperModules);
      });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to load Swiper modules:', error);
    });
};
