/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Expand } from '../utils/types';
import { ControlContext } from './context';
import type {
  GroupConfig,
  GetGroupControlsValue,
  GetGroupControls,
  GetGroupControlsMeta,
} from './define-group.types';

export const defineGroup = <
  TValue extends object,
  TConfig extends GroupConfig = GroupConfig
>(
  config: TConfig
) => {
  const context = new ControlContext({}, { ...config, controls: {} });

  const getWrapper = <TValue, TControls>(controls: TControls) => ({
    get value() {
      return context.getValue() as TValue;
    },
    get title() {
      return context.getMeta().title;
    },
    get path() {
      return context.path;
    },
    get controls() {
      return controls as TControls;
    },
    get editable() {
      return context.getMeta().editable;
    },
    get enabled() {
      return context.getMeta().enabled;
    },
    get readonly() {
      return !context.getMeta().editable /** TODO */;
    },
    get disabled() {
      return (
        (context.parentEnabled ? !context.parentEnabled() : true) ||
        context.getMeta().enabled === false
      );
    },
    setValue: (value: TValue) => {
      value;
    },
    setEditable: (editable: boolean | undefined) => {
      if (editable !== context.getMeta().editable) {
        context.setMeta({ ...context.getMeta(), editable });
      }
    },
    setEnabled: (enabled: boolean | undefined) => {
      if (enabled !== context.getMeta().enabled) {
        context.setMeta({ ...context.getMeta(), enabled });
      }
    },
  });

  const wrapper = getWrapper<TValue, Record<string, never>>({});

  return {
    control: wrapper,
    build: buildFactory(context.getMeta(), context, {}, wrapper),
    withControls: <
      TControls extends {
        [id: string]: {
          build: (
            name: string,
            path: string | undefined,
            initialValue: any,
            initialMeta: any,
            updateState: (value: any, meta: any) => void,
            parentEnabled: () => boolean
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
        build: buildFactory(context.getMeta(), context, controls, wrapper),
        onUpdate: (updater: (group: typeof wrapper) => void) => {
          return {
            control: wrapper,
            build: buildFactory(
              context.getMeta(),
              context,
              controls,
              wrapper,
              updater
            ),
          };
        },
      };
    },
    onUpdate: (x: (group: typeof wrapper) => void) => {
      return {
        control: wrapper,
        build: buildFactory(context.getMeta(), context, {}, wrapper, x),
      };
    },
  };
};

const buildFactory =
  <
    TValue,
    TMeta,
    TControls extends object,
    TWrapper extends { disabled: boolean | undefined },
    TUpdater extends (wrapper: TWrapper) => void
  >(
    state: TMeta,
    context: any,
    controls: TControls,
    wrapper: TWrapper,
    updater?: TUpdater
    // validator?: () => any
  ) =>
  (
    name: string,
    path: string | undefined,
    initialValue: any,
    initialMeta: any,
    updateState: (value: any, meta: any) => void,
    parentEnabled: () => boolean
  ) => {
    context.updateState = updateState;
    context.path = [path, name].filter((item) => !!item).join('.') ?? undefined;
    context.parentEnabled = parentEnabled;

    const controlStates = Object.entries(controls).reduce(
      (result, entry) => {
        const r = entry[1].build(
          entry[0],
          context.path,
          initialValue?.[entry[0]],
          initialMeta?.controls[entry[0]],
          (controlValue: any, controlMeta: any) => {
            const value = context.getValue();
            const meta = context.getMeta();

            context.setState(
              {
                ...value,
                [entry[0]]: controlValue,
              },
              {
                ...meta,
                controls: {
                  ...meta.controls,
                  [entry[0]]: controlMeta,
                },
              }
            );
          },
          () => !wrapper.disabled
        );
        result.value[entry[0]] = r.getValue(); // TODO: is it necessary?
        result.meta[entry[0]] = r.getMeta();
        result.onUpdate[entry[0]] = r.onUpdate;
        return result;
      },
      { value: {}, meta: {}, onUpdate: {} } as any
    );

    if (initialMeta) {
      if (initialValue) {
        context.setValue(initialValue);
      }
      context.setMeta(initialMeta);
    } else {
      const newValue = context.setValue({
        // TODO: is it necessary?
        ...context.getValue(),
        ...controlStates.value,
      });
      const newMeta = context.setMeta({
        ...context.getMeta(),
        controls: controlStates.meta,
      });
      updateState?.(newValue, newMeta);
    }

    const onUpdateAll = () => {
      Object.values<() => void>(controlStates.onUpdate).forEach((onUpdate) =>
        onUpdate()
      );
      updater?.(wrapper);
    };

    return {
      getValue: () =>
        context.getValue() as unknown as Expand<
          TValue & {
            controls: Expand<GetGroupControlsValue<TControls>>;
          }
        >,
      getMeta: () =>
        context.getMeta() as unknown as Expand<
          TMeta & {
            controls: Expand<GetGroupControlsMeta<TControls>>;
          }
        >,
      onUpdate: onUpdateAll,
    };
  };
