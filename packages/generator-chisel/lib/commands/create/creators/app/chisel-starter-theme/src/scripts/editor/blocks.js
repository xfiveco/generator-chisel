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
            const currentClassNames = blockInspector.classList;
            const blockClassName = `e-block-sidebar--${blockNameClassName}`;

            currentClassNames.forEach((className) => {
              if (className.includes('e-block-sidebar')) {
                blockInspector.classList.remove(className);
              }
            });

            blockInspector.classList.add('e-block-sidebar', blockClassName);
          }
        }
      });
    });
  }
}

new Blocks();
