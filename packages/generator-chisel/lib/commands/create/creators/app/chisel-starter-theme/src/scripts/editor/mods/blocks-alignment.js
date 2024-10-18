/* global chiselEditorScripts */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';

const chiselBlocksDefaultAlignment = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { setAttributes, isSelected, name } = props;

    useEffect(() => {
      if (isSelected) {
        const alignment = chiselEditorScripts?.blocksDefaultAlignment?.[name];

        if (alignment) {
          setAttributes({
            align: alignment,
          });
        }
      }
    }, []);

    return <BlockEdit {...props} />;
  };
}, 'blocksAlignmentCustomControls');
addFilter('editor.BlockEdit', 'chisel/blocks-alignment', chiselBlocksDefaultAlignment);
