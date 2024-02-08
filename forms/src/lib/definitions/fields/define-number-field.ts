import { ControlContext } from '../context';
import { defineField, fieldWrapperFactory } from '../define-field';
import { FieldConfig, FieldMeta } from '../define-field.types';

export type NumberFieldConfig = FieldConfig<number | null>;

export const defineNumberField = <TConfig extends NumberFieldConfig>(
  config: TConfig
) => {
  return defineField(
    config.defaultValue ?? null,
    { type: 'number' as const } && config,
    numberFieldWrapperFactory
  );
};

export const numberFieldWrapperFactory = <
  TMeta extends FieldMeta<number | null> = FieldMeta<number | null>
>(
  context: ControlContext<number | null, TMeta>
) => {
  // must be Object.assign, deconstruction does not work
  return Object.assign(fieldWrapperFactory<number | null>(context), {
    setValue: (newValue: number | null) => {
      if ((newValue as unknown) === '') {
        newValue = null;
      }
      if (typeof newValue === 'string') {
        newValue = parseFloat(newValue as string);
      }
      const value = context.getValue();
      if (newValue !== value) {
        context.setValue(newValue);
      }
    },
    increment() {
      const value = context.getValue();
      if (null !== value) {
        context.setValue(value + 1);
      }
    },
  });
};
