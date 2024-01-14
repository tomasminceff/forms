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

  constructor(private state: TState) {}
  getState() {
    return this.state;
  }
  setState(state: TState) {
    this.state = state;
    this.updateState?.(this.state);
    return this.state;
  }
}
