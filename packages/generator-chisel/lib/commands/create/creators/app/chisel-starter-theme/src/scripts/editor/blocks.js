import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';
import { select, subscribe } from '@wordpress/data';

class Blocks {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      subscribe(() => {
        const selectedBlock = select('core/block-editor').getSelectedBlock();
        const isBlockSidebarOpen =
          select('core/edit-post').getActiveGeneralSidebarName() === 'edit-post/block';

        if (selectedBlock?.name && isBlockSidebarOpen) {
          const blockInspector = document.querySelector('.block-editor-block-inspector');

          if (blockInspector) {
            const blockNameClassName = selectedBlock.name.replace('/', '-');
            blockInspector.classList.add(
              'e-block-sidebar',
              `e-block-sidebar--${blockNameClassName}`,
            );
          }
        }
      });
    });
  }
}

new Blocks();

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
