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
  };

  let setState = (value: typeof state) => {
    state = value;
  };

  const getUpdaters = <TValue, TControls>(controls: TControls) => ({
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
        setState({ ...state, editable });
      }
    },
    setEnabled: (enabled: boolean | undefined) => {
      if (enabled !== state.enabled) {
        setState({ ...state, enabled });
      }
    },
  });

  const updaters = getUpdaters<TValue, Record<string, never>>({});

  return {
    withControls: <
      TControls extends {
        [id: string]: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const updaters = getUpdaters<
        Expand<TValue & GetGroupControlsValue<TControls>>,
        Expand<GetGroupControls<TControls>>
      >(
        Object.entries(controls).reduce((result, entry) => {
          result[entry[0]] = entry[1].control;
          return result;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, {} as any)
      );

      return {
        onUpdate: (x: (group: typeof updaters) => void) => {
          return {
            control: updaters,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            build: (
              name: string,
              path?: string,
              initialState?: any,
              updateState?: (controlState: any) => void,
              parentEnabled?: () => boolean
            ) => {
              const controlStates = Object.entries(controls).reduce(
                (result, entry) => {
                  const r = entry[1].build(
                    entry[0],
                    context.path,
                    initialState?.controls[entry[0]],
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    (controlState: any) => {
                      setState({
                        ...state,
                        controls: {
                          ...state.controls,
                          [entry[0]]: controlState,
                        },
                      });
                    },
                    () => !!updaters.enabled
                  );
                  result.state[entry[0]] = r.getState();
                  result.onUpdate[entry[0]] = r.onUpdate;
                  return result;
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { state: {}, onUpdate: {} } as any
              );

              if (initialState) {
                state = initialState;
              } else {
                state = { ...state, controls: controlStates.state };
              }

              const y = () => {
                Object.values<() => void>(controlStates.onUpdate).forEach(
                  (onUpdate) => onUpdate()
                );
                x(updaters);
              };

              if (updateState) {
                const originalSetState = setState;
                setState = (value) => {
                  originalSetState(value);
                  updateState(state);
                };
              }
              context.path =
                [path, name].filter((item) => !!item).join('.') ?? undefined;
              context.parentEnabled = parentEnabled;

              return {
                getState: () =>
                  state as unknown as Expand<
                    TConfig & {
                      controls: Expand<GetGroupControlsState<TControls>>;
                    }
                  >,
                onUpdate: y,
              };
            },
          };
        },
      };
    },
    onUpdate: (x: (group: typeof updaters) => void) => {
      return {
        control: updaters,
        build: ([name]: [string]) => {
          state = { ...state, name };
          return {
            getState: () => state,
            onUpdate: () => {
              x(updaters);
            },
          };
        },
      };
    },
  };
};
