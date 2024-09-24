import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { PanelBody, SelectControl } from '@wordpress/components';
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
const buttonSizesClassNamesRegex = Utils.generateClassNamesRegex(buttonSizes, 'is-size');
const buttonIconsClassNamesRegex = Utils.generateClassNamesRegex(buttonIcons, 'has-icon');

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
      }),
    });
  }

  return settings;
};
addFilter('blocks.registerBlockType', 'chisel/button-block', chiselButtonBlockAttributes);

const chiselButtonCustomControls = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { attributes, setAttributes, isSelected } = props;

    let { buttonSize = '', className = '', buttonIcon = '' } = attributes;

    return (
      <Fragment>
        <BlockEdit {...props} />

        {isSelected && props.name === blockName && (
          <InspectorControls>
            <PanelBody title={__('Button Size', 'lps')}>
              <SelectControl
                label={__('Size', 'lps')}
                options={buttonSizes}
                value={buttonSize}
                onChange={(value) => {
                  className = Utils.prepareClassName(className, buttonSizesClassNamesRegex);

                  if (value) {
                    className += ` ${`is-size-${value}`}`;
                  }

                  setAttributes({
                    buttonSize: value,
                    className,
                  });
                }}
              />
            </PanelBody>
            <PanelBody title={__('Button Icon', 'lps')}>
              <SelectControl
                label={__('Icon', 'lps')}
                options={buttonIcons}
                value={buttonIcon}
                onChange={(value) => {
                  className = Utils.prepareClassName(className, buttonIconsClassNamesRegex);
                  className = className.replace('has-icon', '').trim();

                  if (value) {
                    className += ` has-icon ${`has-icon-${value}`}`;
                  }

                  setAttributes({
                    buttonIcon: value,
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
