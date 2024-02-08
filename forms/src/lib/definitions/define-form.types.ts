/* eslint-disable @typescript-eslint/no-explicit-any */
export type FormControl = {
  control: any;
  build: (
    name: string,
    path?: string,
    initialValue?: any,
    initialMeta?: any,
    updateState?: (value: any, meta: any) => void,
    parentEnabled?: () => boolean
  ) => {
    getValue: () => any;
    getMeta: () => any;
    onUpdate: () => void;
  };
};
