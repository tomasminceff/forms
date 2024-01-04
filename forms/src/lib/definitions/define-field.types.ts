export type FieldConfig<TValue> = {
  title: string;
  defaultValue?: TValue;

  editable?: boolean;
  enabled?: boolean;

  /** use {@link FieldConfig.editable | editable property} */
  readonly?: never;

  /** use {@link FieldConfig.enabled | editable property} */
  disabled?: never;
};
