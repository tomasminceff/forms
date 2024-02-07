/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractControlState, ControlContext } from './abstract-control';
import { Wrapper, baseControlWrapperFactory } from './base-wrapper';
import type { FieldConfig, FieldState } from './define-field.types';

export const defineField = <
  TValue,
  TConfig extends FieldConfig<TValue>,
  TWrapper extends Wrapper<TValue>
>(
  defaultValue: TValue,
  config: TConfig,
  wrapperFactory: (
    context: ControlContext<TValue, FieldState<TValue>>
  ) => TWrapper
) => {
  const state: FieldState<TValue> = {
    value: defaultValue,
    ...config,
  };

  const context = new ControlContext<TValue, FieldState<TValue>>(
    state.value,
    state
  );
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
    TState extends AbstractControlState<TValue>,
    TWrapper,
    TUpdater extends (wrapper: TWrapper) => void
  >(
    context: ControlContext<TValue, TState>,
    wrapper: TWrapper,
    updater?: TUpdater,
    validator?: () => any
  ) =>
  (
    name: string,
    parentPath: string | undefined,
    initialState: TState | undefined,
    updateState: (controlState: TState) => void,
    parentEnabled: () => boolean
  ) => {
    if (initialState) {
      context.setState(initialState);
    } else {
      updateState(context.getState());
    }

    context.path = [parentPath, name].filter((item) => !!item).join('.');
    context.parentEnabled = parentEnabled;
    context.updateState = updateState;

    return {
      getState: () => context.getState(),
      onUpdate: () => {
        updater?.(wrapper);
      },
      validator,
    };
  };

export const fieldWrapperFactory = <
  TValue,
  TState extends FieldState<TValue> = FieldState<TValue>
>(
  context: ControlContext<TValue, TState>
) => {
  return baseControlWrapperFactory<TValue>(context);
};

// bivariant hack: https://www.typescriptlang.org/play?ssl=4&ssc=101&pln=4&pc=1#code/MYGwhgzhAECCB2BLAtmE0De0AOAnRAbmAC4Cm0AHgFwCu8AJqQGaLyn3QC+AsAFCiQYAEQD2Ac2ikKZBjAQo0mHPiJlo9KtDqMWbDj159iAT2zkAQoTD4w8YgFECpOwAlb9EKVwAee5OnO9HJIqCAAfNAAvEoARlY28MCkbsAA1gAUpE52mvYAlJoEIoj6ANoARHFECUkpqeUAugDcRqbkjs7EbgyePn5SMkFwIWgR0ZnZxLl5URFFJXx8nsTQIrmT3R5e3vKhY9Dpa9CiYjOREVic0AD019BMYIggMNpe0BDE+MDEAGJ034gRPAACptCBLUgrEQAJk0lmqiFsDg27l6OxG4SiByOJzOFy4NzuHye6BEqWgWgYbw+X1+-2IgJBYOgQA
