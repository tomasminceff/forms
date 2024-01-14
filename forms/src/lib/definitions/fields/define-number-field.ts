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
  return {
    ...fieldWrapperFactory<number | null>(context),
    ...{
      increment() {
        const state = context.getState();
        if (null !== state.value) {
          context.setState({ ...state, value: state.value + 1 });
        }
      },
    },
  };
};
