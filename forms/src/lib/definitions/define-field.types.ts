import {
  AbstractControlConfig,
  ControlContext,
  AbstractControlState,
} from './abstract-control';

// eslint-disable-next-line @typescript-eslint/ban-types
export type FieldConfig<TValue> = AbstractControlConfig<TValue> & {};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FieldState<TValue> = AbstractControlState<TValue> & {};

export type FieldContext<
  TValue,
  TState extends FieldState<TValue>
> = ControlContext<TValue, TState>;
