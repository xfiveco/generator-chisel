import { select, subscribe } from '@wordpress/data';

class Blocks {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      subscribe(() => {
        const selectedBlock = select('core/block-editor')?.getSelectedBlock();
        // const isBlockSidebarOpen =
        //   select('core/edit-post')?.getActiveGeneralSidebarName() === 'edit-post/block';

        if (selectedBlock?.name) {
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
