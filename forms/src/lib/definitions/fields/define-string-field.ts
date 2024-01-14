import { ControlContext } from '../abstract-control';
import { defineField, fieldWrapperFactory } from '../define-field';
import { FieldConfig, FieldState } from '../define-field.types';

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
  TState extends FieldState<string | null> = FieldState<string | null>
>(
  context: ControlContext<string | null, TState>
) => {
  return fieldWrapperFactory<string | null>(context);
};
