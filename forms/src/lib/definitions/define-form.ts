/* eslint-disable @typescript-eslint/no-explicit-any */

const MAX_UPDATES = 10;

export const defineForm = <
  TFormControl extends {
    control: { enabled: boolean | undefined };
    build: (
      name: string,
      path: string | undefined,
      initialValue: any,
      initialMeta: any,
      updateState: (value: any, meta: any) => void,
      parentEnabled: () => boolean
    ) => {
      getValue: () => any;
      getMeta: () => any;
      onUpdate: () => void;
    };
  }
>(
  name: string,
  control: TFormControl
): TFormControl extends {
  control: infer IControl;
  build: (...ars: infer IParams) => {
    getMeta: infer IGetMeta;
    getValue: infer IGetValue;
  };
}
  ? {
      control: IControl;
      getMeta: IGetMeta;
      getValue: IGetValue;
      getState: () => { value: any; meta: any };
    }
  : never => {
  let isUpdating = false;
  let onUpdate: () => void = () => {};

  let getValue: () => any = () => {};
  let getMeta: () => any = () => {};

  const builded = control.build(
    name,
    undefined,
    undefined,
    undefined,
    (value: any, meta: any) => {
      if (isUpdating) {
        return;
      }

      isUpdating = true;

      let newValue = value;
      let newMeta = meta;
      let oldValue;
      let oldMeta;
      let counter = 0;
      do {
        oldValue = newValue;
        oldMeta = newMeta;
        onUpdate();
        newValue = getValue();
        newMeta = getMeta();
        counter++;
      } while (
        (newMeta !== oldMeta || newValue !== oldValue) &&
        counter <= MAX_UPDATES
      );

      if (counter >= MAX_UPDATES) {
        throw new Error('unstable or too complex');
      }

      isUpdating = false;
    },
    () => !!control.control.enabled
  );

  onUpdate = builded.onUpdate;
  getValue = builded.getValue;
  getMeta = builded.getMeta;

  return {
    getValue,
    getMeta,
    getState: () => ({ value: getValue(), meta: getMeta() }),
    control: control.control,
  } as any;
};
