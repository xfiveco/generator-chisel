import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/blockEditor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

addFilter('blocks.registerBlockType', 'chisel/add-no-margin-attribute', (settings, name) => {
  if (!name.includes('core/') && !name.includes('chisel/')) {
    return settings;
  }

  if (typeof settings.attributes !== 'undefined') {
    settings.attributes = {
      ...settings.attributes,
      disableBottomMargin: {
        type: 'boolean',
        default: false,
      },
    };
  }
  return settings;
});

const addNoMarginToggle = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { attributes, setAttributes, isSelected, name } = props;

    if (!name.includes('core/') && !name.includes('chisel/')) {
      return <BlockEdit {...props} />;
    }

    const { disableBottomMargin = false, className = '' } = attributes;

    const onToggle = (checked) => {
      let newClassName = className.replace(/\bu-no-margin-bottom\b/, '').trim();
      if (checked) {
        newClassName = `${newClassName} u-no-margin-bottom`.trim();
      }
      setAttributes({
        disableBottomMargin: checked,
        className: newClassName,
      });
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        {isSelected && (
          <InspectorControls>
            <PanelBody title={__('Spacing', 'chisel')}>
              <ToggleControl
                label={__('Disable bottom spacing', 'chisel')}
                help={__('Removes the bottom spacing', 'chisel')}
                checked={!!disableBottomMargin}
                onChange={onToggle}
              />
            </PanelBody>
          </InspectorControls>
        )}
      </Fragment>
    );
  };
}, 'addNoMarginToggle');

addFilter('editor.BlockEdit', 'chisel/add-no-margin-toggle', addNoMarginToggle);
