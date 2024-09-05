import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/components';
import { dispatch } from '@wordpress/data';

const BlockEditSelectorButtonDefaults = {
  label: __('Edit', 'chisel'),
  iconName: 'edit',
  variant: 'secondary',
  size: 'small',
};

export default function BlockEditSelector({
  clientId,
  blockName,
  classNameModifier = 'default',
  button = BlockEditSelectorButtonDefaults,
}) {
  const buttonAttrs = { ...BlockEditSelectorButtonDefaults, ...button };

  return (
    <div className={`c-block-edit-selector c-block-edit-selector--${classNameModifier}`}>
      <div className="c-block-edit-selector__inner">
        <button
          type="button"
          className={`c-block-edit-selector__button components-button is-${buttonAttrs.variant} is-${buttonAttrs.size}`}
          onClick={() => {
            dispatch('core/block-editor').selectBlock(clientId);
          }}
          aria-label={buttonAttrs.label}
        >
          <Icon icon={buttonAttrs.iconName} />
          <span>
            {__('Edit', 'chisel')} {blockName}
          </span>
        </button>
      </div>
    </div>
  );
}
