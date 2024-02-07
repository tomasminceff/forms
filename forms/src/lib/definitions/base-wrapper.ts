import { ControlContext, AbstractControlState } from './abstract-control';

export const baseControlWrapperFactory = <
  TValue,
  TState extends AbstractControlState<TValue> = AbstractControlState<TValue>
>(
  context: ControlContext<TValue, TState>
) => ({
  get title() {
    return context.getState().title;
  },
  get path() {
    return context.path;
  },
  get defaultValue() {
    return context.getState().defaultValue;
  },
  get value() {
    return context.getState().value;
  },
  get editable() {
    return context.getState().editable;
  },
  get enabled() {
    return context.getState().enabled;
  },
  get readonly() {
    return !context.getState().editable /** TODO */;
  },
  get disabled() {
    return (
      (context.parentEnabled ? !context.parentEnabled() : true) ||
      context.getState().enabled === false
    );
  },
  setValue: (value: TValue) => {
    const state = context.getState();
    if (value !== state.value) {
      context.setState({ ...state, value });
    }
  },
  setEditable: (editable: boolean | undefined) => {
    const state = context.getState();
    if (editable !== state.editable) {
      context.setState({ ...state, editable });
    }
  },
  setEnabled: (enabled: boolean | undefined) => {
    const state = context.getState();
    if (enabled !== state.enabled) {
      context.setState({ ...state, enabled });
    }
  },
  validate: (x: () => Record<string, object>) => {
    const result = x();
    result;
  },
});

export type Wrapper<TValue> = ReturnType<
  typeof baseControlWrapperFactory<TValue>
>;
