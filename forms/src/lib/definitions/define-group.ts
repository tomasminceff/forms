/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Expand } from '../utils/types';
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
  let value = {};
  let meta = { ...config, controls: {} };

  const context = {
    path: undefined as string | undefined,
    parentEnabled: undefined as (() => boolean) | undefined,

    getValue: () => {
      return value;
    },
    setValue: (newValue: TValue) => {
      value = newValue;
    },

    setMeta: (newMeta: typeof meta) => {
      meta = newMeta;
    },
    getMeta: () => meta,

    updateState: (newValue: TValue, newMeta: typeof meta) => {
      value = newValue;
      meta = newMeta;
    },
  };

  const getWrapper = <TValue, TControls>(controls: TControls) => ({
    get value() {
      return {} as TValue;
    },
    get title() {
      return meta.title;
    },
    get path() {
      return context.path;
    },
    get controls() {
      return controls;
    },
    get editable() {
      return meta.editable;
    },
    get enabled() {
      return meta.enabled;
    },
    get readonly() {
      return !meta.editable /** TODO */;
    },
    get disabled() {
      return (
        (context.parentEnabled ? !context.parentEnabled() : true) ||
        meta.enabled === false
      );
    },
    setValue: (value: TValue) => {
      value;
    },
    setEditable: (editable: boolean | undefined) => {
      if (editable !== meta.editable) {
        context.setMeta({ ...meta, editable });
      }
    },
    setEnabled: (enabled: boolean | undefined) => {
      if (enabled !== meta.enabled) {
        context.setMeta({ ...meta, enabled });
      }
    },
  });

  const wrapper = getWrapper<TValue, Record<string, never>>({});

  return {
    control: wrapper,
    build: buildFactory(meta, context, {}, wrapper),
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
        build: buildFactory(meta, context, controls, wrapper),
        onUpdate: (updater: (group: typeof wrapper) => void) => {
          return {
            control: wrapper,
            build: buildFactory(meta, context, controls, wrapper, updater),
          };
        },
      };
    },
    onUpdate: (x: (group: typeof wrapper) => void) => {
      return {
        control: wrapper,
        build: buildFactory(meta, context, {}, wrapper, x),
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
    const controlStates = Object.entries(controls).reduce(
      (result, entry) => {
        const r = entry[1].build(
          entry[0],
          context.path,
          initialValue?.[entry[0]],
          initialMeta?.controls[entry[0]],
          (controlValue: any, controlMeta: any) => {
            const value = context.getValue();
            context.setValue({
              ...value,
              [entry[0]]: controlValue,
            });

            const meta = context.getMeta();
            context.setMeta({
              ...meta,
              controls: {
                ...meta.controls,
                [entry[0]]: controlMeta,
              },
            });
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

    // is it necessary?
    const originalSetMeta = context.setMeta;
    context.setMeta = (meta: TMeta) => {
      const newMeta = originalSetMeta(meta);
      updateState(context.getValue(), newMeta);
    };

    context.path = [path, name].filter((item) => !!item).join('.') ?? undefined;
    context.parentEnabled = parentEnabled;

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
