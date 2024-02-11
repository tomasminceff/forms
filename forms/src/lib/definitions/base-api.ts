import { ControlContext, AbstractMeta } from './context';

export const baseControlApiFactory = <
  TValue,
  TMeta extends AbstractMeta<TValue> = AbstractMeta<TValue>
>(
  context: ControlContext<TValue, TMeta>
) => ({
  get title() {
    return context.getMeta().title;
  },
  get path() {
    return context.path;
  },
  get defaultValue() {
    return context.getMeta().defaultValue;
  },
  get value() {
    return context.getValue();
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
  setValue: (newValue: TValue) => {
    const value = context.getValue();
    if (newValue !== value) {
      context.setValue(newValue);
    }
  },
  setEditable: (editable: boolean | undefined) => {
    const meta = context.getMeta();
    if (editable !== meta.editable) {
      context.setMeta({ ...meta, editable });
    }
  },
  setEnabled: (enabled: boolean | undefined) => {
    const meta = context.getMeta();
    if (enabled !== meta.enabled) {
      context.setMeta({ ...meta, enabled });
    }
  },
  validate: (x: () => Record<string, object>) => {
    const result = x();
    result;
  },
});

export type ControlApi<TValue> = ReturnType<
  typeof baseControlApiFactory<TValue>
>;
