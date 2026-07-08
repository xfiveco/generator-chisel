import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';

addFilter('blocks.registerBlockType', 'chisel/blocks/spacerSupports', (settings, name) => {
  if (name !== 'core/spacer') {
    return settings;
  }

  return {
    ...settings,
    supports: {
      ...settings.supports,
      spacing: false,
    },
  };
});

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
