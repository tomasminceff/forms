/* eslint-disable @typescript-eslint/no-explicit-any */

const MAX_UPDATES = 10;

export const defineForm = <
  TFormControl extends {
    control: { enabled: boolean | undefined };
    build: (
      name: string,
      path: string | undefined,
      initialState: any,
      updateState: (controlState: any) => void,
      parentEnabled: () => boolean
    ) => {
      getState: () => any;
      onUpdate: () => void;
    };
  }
>(
  name: string,
  control: TFormControl
): TFormControl extends {
  control: infer IControl;
  build: (...ars: infer IParams) => {
    getState: infer IGetState;
    // getValue: infer IGetValue;
  };
}
  ? { control: IControl; getState: IGetState /*getValue: IGetValue*/ }
  : never => {
  let isUpdating = false;
  let onUpdate: () => void = () => {};
  let getState: () => any = () => {};
  // let getValue: () => any = () => {};

  const builded = control.build(
    name,
    undefined,
    undefined,
    (state: any) => {
      if (isUpdating) {
        return;
      }

      isUpdating = true;

      let newState = state;
      let oldState;
      let counter = 0;
      do {
        oldState = newState;
        onUpdate();
        newState = getState();
        counter++;
      } while (newState !== oldState && counter <= MAX_UPDATES);

      if (counter >= MAX_UPDATES) {
        throw new Error('unstable or too complex');
      }

      isUpdating = false;
    },
    () => !!control.control.enabled
  );

  onUpdate = builded.onUpdate;
  getState = builded.getState;

  return {
    getState: builded.getState,
    control: control.control,
  } as any;
};
