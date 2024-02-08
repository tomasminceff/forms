import { ControlContext } from '../context';
import { defineField, fieldWrapperFactory } from '../define-field';
import { FieldConfig, FieldMeta } from '../define-field.types';

// maxLenght + validation

export type StringFieldConfig = FieldConfig<string | null>;

export const defineStringField = <TConfig extends StringFieldConfig>(
  config: TConfig
) => {
  return defineField(
    config.defaultValue ?? null,
    { type: 'text' as const } && config,
    stringFieldWrapperFactory
  );
};

export const stringFieldWrapperFactory = <
  TMeta extends FieldMeta<string | null> = FieldMeta<string | null>
>(
  context: ControlContext<string | null, TMeta>
) => {
  return fieldWrapperFactory<string | null>(context);
};
