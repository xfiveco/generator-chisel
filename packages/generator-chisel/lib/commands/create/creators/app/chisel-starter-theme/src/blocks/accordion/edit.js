import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, BaseControl, ToggleControl, SelectControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import RenderAppender from '../../scripts/editor/components/RenderAppender.js';
import BlockEditSelector from '../../scripts/editor/components/BlockEditSelector.js';

import './editor.scss';

const titleTagOptions = [
  { label: __('H2', 'chisel'), value: 'h2' },
  { label: __('H3', 'chisel'), value: 'h3' },
  { label: __('H4', 'chisel'), value: 'h4' },
  { label: __('H5', 'chisel'), value: 'h5' },
  { label: __('H6', 'chisel'), value: 'h6' },
  { label: __('P', 'chisel'), value: 'p' },
  { label: __('Span', 'chisel'), value: 'span' },
  { label: __('Div', 'chisel'), value: 'div' },
];

export default function Edit(props) {
  const { clientId, attributes, setAttributes } = props;
  const { closeOthers, firstOpen, titleTag } = attributes;

  const blockProps = useBlockProps({
    className: 'has-custom-render-appender',
  });

  return (
    <Fragment>
      <InspectorControls>
        <PanelBody title={__('Accordion Settings', 'chisel')}>
          <BaseControl>
            <SelectControl
              label={__('Title tag', 'chisel')}
              value={titleTag}
              options={titleTagOptions}
              onChange={(tag) => setAttributes({ titleTag: tag })}
            />
          </BaseControl>
          <BaseControl>
            <ToggleControl
              label={__('First item open', 'chisel')}
              checked={!!firstOpen}
              onChange={(is) => {
                setAttributes({ firstOpen: is });
              }}
            />
          </BaseControl>
          <BaseControl>
            <ToggleControl
              label={__('Close other items', 'chisel')}
              help={__('Close all other items when opening a new item.', 'chisel')}
              checked={!!closeOthers}
              onChange={(is) => {
                setAttributes({ closeOthers: is });
              }}
            />
          </BaseControl>
        </PanelBody>
      </InspectorControls>
      <div {...blockProps}>
        <BlockEditSelector
          clientId={clientId}
          blockName={__('Accordion', 'chisel')}
          classNameModifier="accordion"
        />
        <div className="b-accordion">
          <InnerBlocks
            allowedBlocks={['chisel/accordion-item']}
            template={[['chisel/accordion-item']]}
            renderAppender={() => (
              <RenderAppender clientId={clientId} classNameModifier="accordion" />
            )}
          />
        </div>
      </div>
    </Fragment>
  );
}
