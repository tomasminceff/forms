import {
  AbstractControlConfig,
  ControlContext,
  AbstractMeta,
} from './abstract-control';

// eslint-disable-next-line @typescript-eslint/ban-types
export type FieldConfig<TValue> = AbstractControlConfig<TValue> & {};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FieldMeta<TValue> = AbstractMeta<TValue> & {};

export type FieldContext<
  TValue,
  TMeta extends FieldMeta<TValue>
> = ControlContext<TValue, TMeta>;
