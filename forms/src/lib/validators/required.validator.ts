/* eslint-disable @typescript-eslint/no-explicit-any */
export const required = (enabled: boolean) => {
  return (value: unknown | any) => {
    if (!enabled) {
      return;
    }
    if (value !== null && value !== undefined) {
      return;
    }

    return { key: 'required', message: 'Value missing' };
  };
};
