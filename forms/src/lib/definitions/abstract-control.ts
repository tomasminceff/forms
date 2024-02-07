/* eslint-disable @typescript-eslint/no-explicit-any */
export type AbstractControlConfig<TValue> = {
  title: string;
  defaultValue?: TValue;

  editable?: boolean;
  enabled?: boolean;

  /** use {@link FieldConfig.editable | editable property} */
  readonly?: never;

  /** use {@link FieldConfig.enabled | editable property} */
  disabled?: never;
};

export type AbstractControlState<TValue> = {
  title: string;
  defaultValue?: TValue;
  value: TValue;
  editable?: boolean;
  enabled?: boolean;
};

export class ControlContext<
  TValue,
  TState extends AbstractControlState<TValue>
> {
  path: string | undefined;
  parentEnabled?: () => boolean;
  updateState?: (controlState: any) => void;
  updateValue?: (value: any) => void;

  constructor(private value: TValue, private state: TState) {}
  getState() {
    return this.state;
  }
  setState(state: TState) {
    this.state = state;
    this.updateState?.(this.state);
    return this.state;
  }

  getValue() {
    return this.value;
  }
  setValue(value: TValue) {
    this.value = value;
    this.updateValue?.(this.value);
    return this.value;
  }
}
