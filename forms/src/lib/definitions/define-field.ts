/* eslint-disable @typescript-eslint/no-explicit-any */
import { Expand } from '../utils/types';
import type { FieldConfig } from './define-field.types';

export const defineField = <
  TValue = string | null,
  TConfig extends FieldConfig<TValue> = FieldConfig<TValue>
>(
  config: TConfig
) => {
  let state = {
    type: 'text' as const,
    value: config.defaultValue ?? null,
    ...config,
  };

  const context = {
    path: undefined as string | undefined,
    parentEnabled: undefined as (() => boolean) | undefined,
  };

  let setState = (value: typeof state) => {
    state = value;
  };

  const updaters = {
    get title() {
      return state.title;
    },
    get path() {
      return context.path;
    },
    get defaultValue() {
      return state.defaultValue;
    },
    get type() {
      return state.type;
    },
    get value() {
      return state.value;
    },
    get editable() {
      return state.editable;
    },
    get enabled() {
      return state.enabled;
    },
    get readonly() {
      return !state.editable /** TODO */;
    },
    get disabled() {
      return (
        (context.parentEnabled ? !context.parentEnabled() : false) ||
        state.enabled === false
      );
    },
    setValue: (value: TValue) => {
      if (value !== state.value) {
        setState({ ...state, value });
      }
    },
    setEditable: (editable: boolean | undefined) => {
      if (editable !== state.editable) {
        setState({ ...state, editable });
      }
    },
    setEnabled: (enabled: boolean | undefined) => {
      if (enabled !== state.enabled) {
        setState({ ...state, enabled });
      }
    },
    validate: (x: () => Record<string, object>) => {
      const result = x();
      result;
    },
  };

  return {
    control: updaters,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    build: (
      name: string,
      parentPath?: string,
      initialState?: any,
      updateState?: (controlState: any) => void,
      parentEnabled?: () => boolean
    ) => {
      if (initialState) {
        state = initialState;
      }

      context.path = [parentPath, name].filter((item) => !!item).join('.');
      context.parentEnabled = parentEnabled;

      if (updateState) {
        const originalSetState = setState;
        setState = (value) => {
          originalSetState(value);
          updateState(state);
        };
      }

      return { getState: () => state };
    },
    onUpdate: (x: (field: typeof updaters) => void) => {
      const buildFactory = (
        name: string,
        parentPath?: string,
        initialState?: any,
        updateState?: (controlState: any) => void,
        parentEnabled?: () => boolean
      ) => {
        if (updateState) {
          const originalSetState = setState;
          setState = (value) => {
            originalSetState(value);
            updateState(state);
          };
        }

        if (initialState) {
          state = initialState;
        }

        context.path = [parentPath, name].filter((item) => !!item).join('.');
        context.parentEnabled = parentEnabled;

        return {
          getState: () => state as unknown as Expand<typeof state>,
          onUpdate: () => {
            x(updaters);
          },
        };
      };
      const afterOnUpdate = {
        control: updaters,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        build: buildFactory,
      };

      return {
        ...afterOnUpdate,
        validate: () => {
          return afterOnUpdate;
        },
      };
    },
  };
};
