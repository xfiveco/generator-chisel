/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {Element} Element to render.
 */
export default function save(props) {
  const { attributes } = props;
  const { closeOthers, firstOpen } = attributes;

  const attributesClassNames = [];

  if (closeOthers) {
    attributesClassNames.push('has-close-others');
  }

  if (firstOpen) {
    attributesClassNames.push('has-first-open');
  }
  return (
    <div
      {...useBlockProps.save({
        className: `b-accordion js-accordion ${attributesClassNames.join(' ')}`,
      })}
    >
      <InnerBlocks.Content />
    </div>
  );
}
