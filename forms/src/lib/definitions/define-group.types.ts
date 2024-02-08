export type GroupConfig = {
  title: string;

  editable?: boolean;
  enabled?: boolean;

  /** use {@link FieldConfig.editable | editable property} */
  readonly?: never;

  /** use {@link FieldConfig.enabled | editable property} */
  disabled?: never;
};

export type GetGroupControlsValue<TControls> = {
  [K in keyof TControls]: TControls[K] extends { control: infer TControl }
    ? TControl extends { get value(): infer TValue }
      ? TValue
      : never
    : never;
};

export type GetGroupControls<TControls> = {
  [K in keyof TControls]: TControls[K] extends {
    control: infer TControlDefinition;
  }
    ? TControlDefinition
    : never;
};

export type GetGroupControlsMeta<TControls> = {
  [K in keyof TControls]: TControls[K] extends {
    build: (...ars: infer IParams) => {
      getMeta: () => infer IGetMeta;
    };
  }
    ? IGetMeta
    : never;
};
