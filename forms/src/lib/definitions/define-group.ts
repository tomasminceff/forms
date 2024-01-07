/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Expand } from '../utils/types';
import type {
  GroupConfig,
  GetGroupControlsValue,
  GetGroupControls,
  GetGroupControlsState,
} from './define-group.types';

export const defineGroup = <
  TValue extends object,
  TConfig extends GroupConfig = GroupConfig
>(
  config: TConfig
) => {
  let state = { ...config, controls: {} };

  const context = {
    path: undefined as string | undefined,
    parentEnabled: undefined as (() => boolean) | undefined,
    setState: (value: typeof state) => {
      return (state = value);
    },
    getState: () => state,
  };

  const getWrapper = <TValue, TControls>(controls: TControls) => ({
    get value() {
      return {} as TValue;
    },
    get title() {
      return state.title;
    },
    get path() {
      return context.path;
    },
    get controls() {
      return controls;
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
      value;
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
  });

  const wrapper = getWrapper<TValue, Record<string, never>>({});

  return {
    control: wrapper,
    build: buildFactory(state, context, {}, wrapper),
    withControls: <
      TControls extends {
        [id: string]: {
          build: (
            name: string,
            path: string | undefined,
            initialState: any,
            updateState: (controlState: any) => void,
            parentEnabled?: () => boolean
          ) => any;
          control: unknown;
        };
      }
    >(
      controls: TControls
    ) => {
      const wrapper = getWrapper<
        Expand<TValue & GetGroupControlsValue<TControls>>,
        Expand<GetGroupControls<TControls>>
      >(
        Object.entries(controls).reduce((result, entry) => {
          result[entry[0]] = entry[1].control;
          return result;
        }, {} as any)
      );

      return {
        control: wrapper,
        build: buildFactory(state, context, controls, wrapper),
        onUpdate: (updater: (group: typeof wrapper) => void) => {
          return {
            control: wrapper,
            build: buildFactory(state, context, controls, wrapper, updater),
          };
        },
      };
    },
    onUpdate: (x: (group: typeof wrapper) => void) => {
      return {
        control: wrapper,
        build: buildFactory(state, context, {}, wrapper, x),
      };
    },
  };
};

const buildFactory =
  <
    TState,
    TControls extends object,
    TWrapper extends { disabled: boolean | undefined },
    TUpdater extends (wrapper: TWrapper) => void
  >(
    state: TState,
    context: any,
    controls: TControls,
    wrapper: TWrapper,
    updater?: TUpdater
    // validator?: () => any
  ) =>
  (
    name: string,
    path: string | undefined,
    initialState: any,
    updateState: (controlState: any) => void,
    parentEnabled?: () => boolean
  ) => {
    const controlStates = Object.entries(controls).reduce(
      (result, entry) => {
        const r = entry[1].build(
          entry[0],
          context.path,
          initialState?.controls[entry[0]],
          (controlState: any) => {
            const state = context.getState();
            context.setState({
              ...state,
              controls: {
                ...state.controls,
                [entry[0]]: controlState,
              },
            });
          },
          () => !wrapper.disabled
        );
        result.state[entry[0]] = r.getState();
        result.onUpdate[entry[0]] = r.onUpdate;
        return result;
      },
      { state: {}, onUpdate: {} } as any
    );

    if (initialState) {
      context.setState(initialState);
    } else {
      const newState = context.setState({
        ...context.getState,
        controls: controlStates.state,
      });
      updateState?.(newState);
    }

    const onUpdateAll = () => {
      Object.values<() => void>(controlStates.onUpdate).forEach((onUpdate) =>
        onUpdate()
      );
      updater?.(wrapper);
    };

    const originalSetState = context.setState;
    context.setState = (value: TState) => {
      const state = originalSetState(value);
      updateState(state);
    };

    context.path = [path, name].filter((item) => !!item).join('.') ?? undefined;
    context.parentEnabled = parentEnabled;

    return {
      getState: () =>
        context.getState() as unknown as Expand<
          TState & {
            controls: Expand<GetGroupControlsState<TControls>>;
          }
        >,
      onUpdate: onUpdateAll,
    };
  };
