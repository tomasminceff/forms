/* eslint-disable @typescript-eslint/no-explicit-any */

const MAX_UPDATES = 10;

export const defineForm = <
  TFormControl extends {
    control: any;
    build: (
      name: string,
      path?: string,
      initialState?: any,
      updateState?: (controlState: any) => void,
      parentEnabled?: () => boolean
    ) => {
      getState: () => any;
      onUpdate: () => void;
    };
  }
>(
  name: string,
  control: TFormControl
) => {
  let isUpdating = false;
  let onUpdate: () => void = () => {};
  let getState: () => any = () => {};

  const builded = control.build(name, undefined, undefined, (value: any) => {
    if (isUpdating) {
      return;
    }

    isUpdating = true;

    let newState = value;
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
  });

  onUpdate = builded.onUpdate;
  getState = builded.getState;

  return {
    getState: builded.getState,
    control: control.control,
  };
};
