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
    unregisterBlockStyle('core/button', 'fill');
    unregisterBlockStyle('core/button', 'outline');
  }

  registerBlockStyles() {
    this.registerButtonsStyles();
    this.registerSpacerStyles();
  }

  registerButtonsStyles() {
    const buttonsStyles = [
      {
        name: 'primary',
        label: __('Primary', 'chisel'),
        isDefault: true,
      },
      {
        name: 'secondary',
        label: __('Secondary', 'chisel'),
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
