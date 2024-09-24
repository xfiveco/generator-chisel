import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';

addFilter(
  'editor.BlockEdit',
  'chisel/blocks/blockEdit',
  createHigherOrderComponent((BlockEdit) => {
    return (props) => {
      const { setAttributes, attributes, name } = props;

      useEffect(() => {
        if (name === 'core/spacer') {
          setAttributes({
            height: 'auto',
          });
        }
      }, [attributes?.height]);

      return (
        <>
          <BlockEdit key="edit" {...props} />
        </>
      );
    };
  }, 'chisel/blocks/blockEdit'),
  10,
);
