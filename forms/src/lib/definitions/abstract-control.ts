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

export type AbstractMeta<TValue> = {
  title: string;
  defaultValue?: TValue;
  editable?: boolean;
  enabled?: boolean;
};

export class ControlContext<TValue, TMeta extends AbstractMeta<TValue>> {
  path: string | undefined;
  parentEnabled?: () => boolean;
  updateState?: (value: any, meta: any) => void;

  constructor(private value: TValue, private meta: TMeta) {}
  getMeta() {
    return this.meta;
  }
  setMeta(meta: TMeta) {
    this.meta = meta;
    this.updateState?.(this.value, this.meta);
    return this.meta;
  }

  getValue() {
    return this.value;
  }
  setValue(value: TValue) {
    this.value = value;
    this.updateState?.(this.value, this.meta);
    return this.value;
  }
}
