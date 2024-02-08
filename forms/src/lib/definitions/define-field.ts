/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractMeta, ControlContext } from './context';
import { Wrapper, baseControlWrapperFactory } from './base-wrapper';
import type { FieldConfig, FieldMeta } from './define-field.types';

export const defineField = <
  TValue,
  TConfig extends FieldConfig<TValue>,
  TWrapper extends Wrapper<TValue>
>(
  defaultValue: TValue,
  config: TConfig,
  wrapperFactory: (
    context: ControlContext<TValue, FieldMeta<TValue>>
  ) => TWrapper
) => {
  const value = defaultValue;
  const meta: FieldMeta<TValue> = {
    defaultValue,
    ...config,
  };

  const context = new ControlContext<TValue, FieldMeta<TValue>>(value, meta);
  const wrapper = wrapperFactory(context);

  return {
    control: wrapper,
    build: buildFactory(context, wrapper, undefined),
    onUpdate: (updater: (field: typeof wrapper) => void) => {
      return {
        control: wrapper,
        build: buildFactory(context, wrapper, updater),
        validate: (validator: () => any) => {
          return {
            control: wrapper,
            build: buildFactory(context, wrapper, updater, validator),
          };
        },
      };
    },
    validate: (validator: () => any) => {
      return {
        control: wrapper,
        build: buildFactory(context, wrapper, undefined, validator),
      };
    },
  };
};

const buildFactory =
  <
    TValue,
    TMeta extends AbstractMeta<TValue>,
    TWrapper,
    TUpdater extends (wrapper: TWrapper) => void
  >(
    context: ControlContext<TValue, TMeta>,
    wrapper: TWrapper,
    updater?: TUpdater,
    validator?: () => any
  ) =>
  (
    name: string,
    parentPath: string | undefined,
    initialValue: TValue | undefined,
    initialMeta: TMeta | undefined,
    updateState: (value: TValue, meta: TMeta) => void,
    parentEnabled: () => boolean
  ) => {
    if (initialMeta) {
      if (initialValue) {
        context.setValue(initialValue);
      }
      context.setMeta(initialMeta);
    } else {
      updateState(context.getValue(), context.getMeta());
    }

    context.path = [parentPath, name].filter((item) => !!item).join('.');
    context.parentEnabled = parentEnabled;
    context.updateState = updateState;

    return {
      getValue: () => context.getValue(),
      getMeta: () => context.getMeta(),
      onUpdate: () => {
        updater?.(wrapper);
      },
      validator,
    };
  };

export const fieldWrapperFactory = <
  TValue,
  TMeta extends FieldMeta<TValue> = FieldMeta<TValue>
>(
  context: ControlContext<TValue, TMeta>
) => {
  return baseControlWrapperFactory<TValue>(context);
};

// bivariant hack: https://www.typescriptlang.org/play?ssl=4&ssc=101&pln=4&pc=1#code/MYGwhgzhAECCB2BLAtmE0De0AOAnRAbmAC4Cm0AHgFwCu8AJqQGaLyn3QC+AsAFCiQYAEQD2Ac2ikKZBjAQo0mHPiJlo9KtDqMWbDj159iAT2zkAQoTD4w8YgFECpOwAlb9EKVwAee5OnO9HJIqCAAfNAAvEoARlY28MCkbsAA1gAUpE52mvYAlJoEIoj6ANoARHFECUkpqeUAugDcRqbkjs7EbgyePn5SMkFwIWgR0ZnZxLl5URFFJXx8nsTQIrmT3R5e3vKhY9Dpa9CiYjOREVic0AD019BMYIggMNpe0BDE+MDEAGJ034gRPAACptCBLUgrEQAJk0lmqiFsDg27l6OxG4SiByOJzOFy4NzuHye6BEqWgWgYbw+X1+-2IgJBYOgQA
