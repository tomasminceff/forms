import { ControlContext } from '../abstract-control';
import { defineField, fieldWrapperFactory } from '../define-field';
import { FieldConfig, FieldState } from '../define-field.types';

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
  TState extends FieldState<number | null> = FieldState<number | null>
>(
  context: ControlContext<number | null, TState>
) => {
  // must be Object.assign, deconstruction does not work
  return Object.assign(fieldWrapperFactory<number | null>(context), {
    setValue: (value: number | null) => {
      if ((value as unknown) === '') {
        value = null;
      }
      if (typeof value === 'string') {
        value = parseFloat(value as string);
      }
      const state = context.getState();
      if (value !== state.value) {
        context.setState({ ...state, value });
      }
    },
    increment() {
      const state = context.getState();
      if (null !== state.value) {
        context.setState({ ...state, value: state.value + 1 });
      }
    },
  });
};
