/* global chiselScripts */

const i18n = (key, fallback) => chiselScripts?.i18n?.[key] ?? fallback;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/*
 * Data attributes are always strings. Swiper expects numbers for these options and
 * silently misbehaves on a string, so every numeric option goes through this.
 *
 * @param {string} value - The raw data attribute value.
 * @param {number} fallback - Used when the attribute is absent or not a number.
 *
 * @return {number}
 */
const toNumber = (value, fallback) => {
  const number = parseFloat(value);

  return Number.isNaN(number) ? fallback : number;
};

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

    this.initAutoplayToggle(swiperInstance);
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
      autoplayToggle: null,
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
      autoplayToggle: 'swiper-autoplay-toggle',
      autoplayPaused: 'is-paused',
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
      freeMode: freeMode === 'yes',
      initialSlide: toNumber(initialSlide, 0),
      loop: loop === 'yes',
      parallax: parallax === 'yes',
      slidesPerView: slidesPerView === 'auto' ? 'auto' : toNumber(slidesPerView, 1),
      spaceBetween: toNumber(spaceBetween, 10),
      // Slides still change, they just do not glide there.
      speed: prefersReducedMotion() ? 0 : toNumber(speed, 1000),
      watchSlidesProgress: true,
    };

    this.params = params;

    // A11y and Keyboard are not part of Swiper core, so they ship no defaults and
    // must always be registered - without them the slider is keyboard-inoperable
    // and pagination bullets are bare, unlabelled spans.
    this.use.push(this.swiperModules.A11y, this.swiperModules.Keyboard);

    // {{index}} and {{slidesLength}} are placeholders replaced by Swiper.
    this.params.a11y = {
      enabled: true,
      prevSlideMessage: i18n('previousSlide', 'Previous slide'),
      nextSlideMessage: i18n('nextSlide', 'Next slide'),
      firstSlideMessage: i18n('firstSlide', 'This is the first slide'),
      lastSlideMessage: i18n('lastSlide', 'This is the last slide'),
      paginationBulletMessage: i18n('goToSlide', 'Go to slide {{index}}'),
      slideLabelMessage: i18n('slideLabel', 'Slide {{index}} of {{slidesLength}}'),
    };

    this.params.keyboard = {
      enabled: true,
      onlyInViewport: true,
    };

    // Enable thumbnails.
    if (thumbnails !== '0') {
      this.createThumbnails();
    }

    // Enable autoplay. Skipped entirely when the visitor asked for reduced motion.
    if (autoplay === 'yes' && !prefersReducedMotion()) {
      const delay = toNumber(autoplayTimeout, 5000);

      this.use.push(this.swiperModules.Autoplay);
      this.params.autoplay = {
        delay: delay < 1000 ? 1000 : delay,
        disableOnInteraction: false,
      };

      this.createAutoplayToggle();
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
      ariaLabel: i18n('previousSlide', 'Previous slide'),
    });

    const navigationButtonNext = Object.assign(document.createElement('button'), {
      type: 'button',
      className: `${this.classNames.navigationButton} ${this.classNames.navigationNext}`,
      ariaLabel: i18n('nextSlide', 'Next slide'),
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
   * Create the autoplay pause/play control. Auto-advancing content must be
   * stoppable by the visitor (WCAG 2.2.2).
   */
  createAutoplayToggle() {
    const button = Object.assign(document.createElement('button'), {
      type: 'button',
      className: this.classNames.autoplayToggle,
      ariaLabel: i18n('pauseAutoplay', 'Pause automatic slide rotation'),
    });

    this.elements.slider.appendChild(button);

    this.elements.autoplayToggle = button;
  }

  /*
   * Wire the autoplay pause/play control to the swiper instance.
   *
   * @param {object} swiperInstance - The initialized swiper.
   */
  initAutoplayToggle(swiperInstance) {
    const button = this.elements.autoplayToggle;

    if (!button || !swiperInstance.autoplay) {
      return;
    }

    button.addEventListener('click', () => {
      const isPlaying = !button.classList.contains(this.classNames.autoplayPaused);

      if (isPlaying) {
        swiperInstance.autoplay.stop();
      } else {
        swiperInstance.autoplay.start();
      }

      button.classList.toggle(this.classNames.autoplayPaused, isPlaying);
      button.setAttribute(
        'aria-label',
        isPlaying
          ? i18n('playAutoplay', 'Start automatic slide rotation')
          : i18n('pauseAutoplay', 'Pause automatic slide rotation'),
      );
    });
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

      // Checked before the attributes are stripped - bailing afterwards would leave
      // the thumbnail with no src at all. One unusable slide skips itself rather
      // than taking down the whole slider.
      if (!slideImg || !thumbnailUrl) {
        // eslint-disable-next-line no-console
        console.warn(
          'Slider thumbnail skipped: slide needs an img and a data-thumbnail-url.',
          slide,
        );

        return;
      }

      ['src', 'srcset', 'sizes', 'width', 'height'].forEach((attr) => {
        slideImg.removeAttribute(attr);
      });

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
      slidesPerView: toNumber(thumbnails, 1),
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
        // Isolated per slider - without this one malformed slider throws out of the
        // loop into the catch below and every other slider on the page stays dead.
        try {
          new Slider(slider, swiper, swiperModules);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to initialize slider:', error, slider);
        }
      });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to load Swiper modules:', error);
    });
};
