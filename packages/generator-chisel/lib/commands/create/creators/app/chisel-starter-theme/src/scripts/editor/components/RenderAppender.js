import { __ } from '@wordpress/i18n';
import { Inserter } from '@wordpress/block-editor';
import { Button, Icon } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

export default function RenderAppender({
  clientId,
  label = __('Add new item', 'chisel'),
  iconName = 'plus',
  classNameModifier = 'default',
}) {
  return (
    <Inserter
      rootClientId={clientId}
      renderToggle={({ onToggle, disabled }) => (
        <Fragment>
          <Button
            className={`c-block-appender c-block-appender--${classNameModifier}`}
            variant="primary"
            onClick={onToggle}
            disabled={disabled}
            label={label}
          >
            <Icon icon={iconName} />
            <span>{label}</span>
          </Button>
        </Fragment>
      )}
      isAppender
    />
  );
}
