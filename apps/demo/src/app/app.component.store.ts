import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

export const CounterStore = signalStore(
  withState({ x: { y: { count: 0 } } }),
  withComputed(
    ({
      x: {
        y: { count },
      },
    }) => ({
      doubleCount: computed(() => count() * 2),
    })
  ),
  withMethods(({ x, ...store }) => ({
    increment() {
      patchState(store, { x: { y: { count: x.y.count() + 1 } } });
    },
    decrement() {
      patchState(store, { x: { y: { count: x.y.count() - 1 } } });
    },
  }))
);
