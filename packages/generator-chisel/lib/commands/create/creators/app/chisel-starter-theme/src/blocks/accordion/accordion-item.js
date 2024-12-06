import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { RichText, InnerBlocks } from '@wordpress/block-editor';
import { cleanForSlug } from '@wordpress/url';
import { Fragment, useEffect } from '@wordpress/element';
import BlockEditSelector from '../../scripts/editor/components/BlockEditSelector.js';

registerBlockType('chisel/accordion-item', {
  title: __('Accordion Item', 'chisel'),
  icon: 'admin-comments',
  category: 'chisel-blocks',
  parent: ['chisel/accordion'],
  attributes: {
    title: {
      type: 'string',
      default: '',
    },
    titleTag: {
      type: 'string',
      default: '',
    },
  },
  usesContext: ['chiselAccordionTitleTag'],
  edit: (props) => {
    const { attributes, setAttributes, clientId, context } = props;
    const { title } = attributes;
    const itemId = cleanForSlug(title);

    useEffect(() => {
      setAttributes({ titleTag: context.chiselAccordionTitleTag });
    }, [context.chiselAccordionTitleTag]);

    return (
      <Fragment>
        <BlockEditSelector
          clientId={clientId}
          blockName={__('Accordion Item', 'chisel')}
          classNameModifier="accordion-item"
        />
        <div className="b-accordion__item" id={itemId}>
          <div className="b-accordion__item-header">
            <RichText
              tagName={context.chiselAccordionTitleTag}
              className="b-accordion__item-title"
              placeholder={__('Title', 'chisel')}
              indentifier="title"
              allowedFormats={['core/bold', 'core/italic']}
              value={title}
              onChange={(title) => setAttributes({ title })}
            />
          </div>
          <div className="b-accordion__item-content">
            <InnerBlocks />
          </div>
        </div>
      </Fragment>
    );
  },
  save: ({ attributes }) => {
    const { title, titleTag } = attributes;
    const itemId = cleanForSlug(title);

    return (
      <details className="b-accordion__item js-accordion-item" id={itemId}>
        <summary className="b-accordion__item-header js-accordion-header">
          <RichText.Content tagName={titleTag} className="b-accordion__item-title" value={title} />

          <span className="b-accordion__icons" aria-hidden="true">
            <i className="o-icon is-css o-icon--icon-plus"></i>
            <i className="o-icon is-css o-icon--icon-minus"></i>
          </span>
        </summary>
        <div className="b-accordion__item-content js-accordion-content">
          <InnerBlocks.Content />
        </div>
      </details>
    );
  },
});
