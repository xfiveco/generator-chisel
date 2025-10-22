import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import { unregisterBlockStyle, registerBlockStyle } from '@wordpress/blocks';

class BlocksStyles {
  constructor() {
    domReady(() => {
      this.unregisterBlockStyles();
      this.registerBlockStyles();
    });
  }

  unregisterBlockStyles() {
    setTimeout(() => {
      unregisterBlockStyle('core/button', ['fill', 'outline']);
    }, 10);
  }

  registerBlockStyles() {
    this.registerButtonsStyles();
    this.registerSpacerStyles();
    // this.registerLatestPostsStyles();
  }

  registerButtonsStyles() {
    const buttonsStyles = [
      {
        name: 'primary',
        label: __('Primary', 'chisel'),
        isDefault: true,
      },
      {
        name: 'primary-outline',
        label: __('Primary Outlined', 'chisel'),
        isDefault: true,
      },
      {
        name: 'secondary',
        label: __('Secondary', 'chisel'),
      },
      {
        name: 'secondary-outline',
        label: __('Secondary Outlined', 'chisel'),
      },
      {
        name: 'tertiary',
        label: __('Tertiary', 'chisel'),
      },
      {
        name: 'tertiary-outline',
        label: __('Tertiary Outlined', 'chisel'),
      },
    ];

    this.registerStyles('core/button', buttonsStyles);
  }

  registerSpacerStyles() {
    const spacerStyles = [
      {
        name: 'default',
        label: __('Default', 'chisel'),
        isDefault: true,
      },
      {
        name: 'tiny',
        label: 'XS',
      },
      {
        name: 'small',
        label: 'S',
      },
      {
        name: 'medium',
        label: 'M',
      },
      {
        name: 'large',
        label: 'L',
      },
      {
        name: 'xlarge',
        label: 'XL',
      },
      {
        name: 'big',
        label: 'BIG',
      },
    ];

    this.registerStyles('core/spacer', spacerStyles);
  }

  registerLatestPostsStyles() {
    const latestPostsStyles = [
      {
        name: 'list',
        label: __('List', 'chisel'),
        isDefault: true,
      },
      {
        name: 'grid-3',
        label: 'Grid of 3',
      },
      {
        name: 'grid-4',
        label: 'Grid of 4',
      },
    ];

    this.registerStyles('core/latest-posts', latestPostsStyles);
  }

  registerStyles = (blockName, styles) => {
    styles.forEach(({ name, label, isDefault }) => {
      registerBlockStyle(blockName, {
        name,
        label,
        isDefault,
      });
    });
  };
}

new BlocksStyles();
