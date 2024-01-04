/* eslint-disable @typescript-eslint/no-explicit-any */
export type FormControl = {
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
};
