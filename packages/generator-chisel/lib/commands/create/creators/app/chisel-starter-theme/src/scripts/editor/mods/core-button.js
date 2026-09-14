import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment, useEffect } from '@wordpress/element';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/blockEditor';
import Utils from '../utils';

const blockName = 'core/button';
const buttonSizes = [
  { label: __('Small', 'chisel'), value: 'small' },
  { label: __('Default', 'chisel'), value: '' },
  { label: __('Large', 'chisel'), value: 'large' },
];
const buttonIcons = [
  {
    label: __('None', 'chisel'),
    value: '',
  },
  ...Utils.generateIconsChoices(),
];

// Add Custom Attributes
const chiselButtonBlockAttributes = (settings, name) => {
  if (name === blockName) {
    settings = Object.assign({}, settings, {
      attributes: Object.assign({}, settings.attributes, {
        buttonSize: {
          type: 'string',
          default: '',
        },
        buttonIcon: {
          type: 'string',
          default: '',
        },
        buttonIconPosition: {
          type: 'boolean',
          default: false,
        },
      }),
    });
  }

  return settings;
};
addFilter('blocks.registerBlockType', 'chisel/button-block', chiselButtonBlockAttributes);

const chiselButtonCustomControls = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { attributes, setAttributes, isSelected, name } = props;

    if (name !== blockName) {
      return <BlockEdit {...props} />;
    }

    let {
      buttonSize = '',
      className = '',
      buttonIcon = '',
      buttonIconPosition = false,
    } = attributes;

    const prev = {
      buttonSize,
      buttonIcon,
    };

    useEffect(() => {
      if (isSelected && className !== '') {
        const attrs = {};
        const size = className.match(/is-size-(\w*)/);
        const icon = className.match(/has-icon-(\w*)/);
        const iconLeft = className.match('has-icon-left');

        if (icon && icon.length) {
          attrs.buttonIcon = icon[1];
        }

        if (size && size.length) {
          attrs.buttonSize = size[1];
        }

        if (iconLeft) {
          attrs.buttonIconPosition = true;
        }

        setAttributes(attrs);
      }
    }, []);

    return (
      <Fragment>
        <BlockEdit {...props} />

        {isSelected && (
          <InspectorControls>
            <PanelBody title={__('Button Size', 'chisel')}>
              <SelectControl
                label={__('Size', 'chisel')}
                options={buttonSizes}
                value={buttonSize}
                onChange={(value) => {
                  const prevClassname = `is-size-${prev.buttonSize}`;
                  className = className.replace(prevClassname, '').trim();

                  if (value) {
                    className += ` is-size-${value}`;
                  }

                  setAttributes({
                    buttonSize: value,
                    className,
                  });
                }}
              />
            </PanelBody>
            <PanelBody title={__('Button Icon', 'chisel')}>
              <SelectControl
                label={__('Icon', 'chisel')}
                options={buttonIcons}
                value={buttonIcon}
                onChange={(value) => {
                  const prevClassname = `has-icon has-icon-${prev.buttonIcon}`;
                  className = className.replace(prevClassname, '').trim();

                  if (value) {
                    className += ` has-icon has-icon-${value}`;
                  }

                  setAttributes({
                    buttonIcon: value,
                    className,
                  });
                }}
              />
            </PanelBody>
            <PanelBody title={__('Icon Position', 'chisel')}>
              <ToggleControl
                label={__('Icon on the left', 'chisel')}
                help={__('By default icons are on the right', 'chisel')}
                checked={!!buttonIconPosition}
                onChange={(isLeft) => {
                  className = className.replace('has-icon-left', '').trim();

                  if (isLeft) {
                    className += ' has-icon-left';
                  }

                  setAttributes({
                    buttonIconPosition: isLeft,
                    className,
                  });
                }}
              />
            </PanelBody>
          </InspectorControls>
        )}
      </Fragment>
    );
  };
}, 'coreButtonCustomControls');
addFilter('editor.BlockEdit', 'chisel/button-block', chiselButtonCustomControls);
