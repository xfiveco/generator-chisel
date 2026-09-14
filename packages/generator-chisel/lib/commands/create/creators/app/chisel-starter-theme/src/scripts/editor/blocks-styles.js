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
      },
      {
        name: 'secondary',
        label: __('Secondary', 'chisel'),
      },
      {
        name: 'secondary-outline',
        label: __('Secondary Outlined', 'chisel'),
      },
    ];

    this.registerStyles('core/button', buttonsStyles);
  }

  registerSpacerStyles() {
    // Sizes are fluid, so the bracket shows the mobile-to-desktop range. Keep in
    // sync with settings.custom.spacer in theme.json.
    const spacerStyles = [
      {
        name: 'default',
        label: `${__('Default', 'chisel')} (1.5-2rem)`,
        isDefault: true,
      },
      {
        name: 'tiny',
        label: `${__('Tiny', 'chisel')} (0.5rem)`,
      },
      {
        name: 'little',
        label: `${__('Little', 'chisel')} (0.75-1rem)`,
      },
      {
        name: 'small',
        label: `${__('Small', 'chisel')} (1-1.5rem)`,
      },
      {
        name: 'normal',
        label: `${__('Normal', 'chisel')} (1.5-2rem)`,
      },
      {
        name: 'medium',
        label: `${__('Medium', 'chisel')} (2-3rem)`,
      },
      {
        name: 'large',
        label: `${__('Large', 'chisel')} (2.5-4rem)`,
      },
      {
        name: 'xlarge',
        label: `${__('XLarge', 'chisel')} (3-5rem)`,
      },
      {
        name: 'big',
        label: `${__('Big', 'chisel')} (3.5-6rem)`,
      },
      {
        name: 'huge',
        label: `${__('Huge', 'chisel')} (4-8rem)`,
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
