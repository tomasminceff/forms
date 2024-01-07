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
    setState: (value: typeof state) => {
      return (state = value);
    },
    getState: () => state,
  };

  const wrapper = {
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
        context.setState({ ...state, value });
      }
    },
    setEditable: (editable: boolean | undefined) => {
      if (editable !== state.editable) {
        context.setState({ ...state, editable });
      }
    },
    setEnabled: (enabled: boolean | undefined) => {
      if (enabled !== state.enabled) {
        context.setState({ ...state, enabled });
      }
    },
    validate: (x: () => Record<string, object>) => {
      const result = x();
      result;
    },
  };

  return {
    control: wrapper,
    build: buildFactory(state, context, wrapper, undefined),
    onUpdate: (updater: (field: typeof wrapper) => void) => {
      return {
        control: wrapper,
        build: buildFactory(state, context, wrapper, updater),
        validate: (validator: () => any) => {
          return {
            control: wrapper,
            build: buildFactory(state, context, wrapper, updater, validator),
          };
        },
      };
    },
    validate: (validator: () => any) => {
      return {
        control: wrapper,
        build: buildFactory(state, context, wrapper, undefined, validator),
      };
    },
  };
};

const buildFactory =
  <TState, TWrapper, TUpdater extends (wrapper: TWrapper) => void>(
    state: TState,
    context: any,
    wrapper: TWrapper,
    updater?: TUpdater,
    validator?: () => any
  ) =>
  (
    name: string,
    parentPath: string | undefined,
    initialState: TState | undefined,
    updateState: (controlState: TState) => void,
    parentEnabled?: () => boolean
  ) => {
    if (initialState) {
      context.setState(initialState);
    } else {
      updateState(state);
    }

    const originalSetState = context.setState;
    context.setState = (value: TState) => {
      const newState = originalSetState(value);
      updateState(newState);
      return newState;
    };

    context.path = [parentPath, name].filter((item) => !!item).join('.');
    context.parentEnabled = parentEnabled;

    return {
      getState: () => context.getState() as unknown as Expand<typeof state>,
      onUpdate: () => {
        updater?.(wrapper);
      },
      validator,
    };
  };
