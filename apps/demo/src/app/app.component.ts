import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CounterStore } from './app.component.store';
import { CommonModule } from '@angular/common';
import {
  InputDirective,
  defineForm,
  defineGroup,
  defineNumberField,
  defineStringField,
} from '@org/forms';

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, InputDirective],
  selector: 'org-root',
  template: `<button (click)="increment()">Press me</button>
    <pre>{{ form | json }}</pre>
    <div>
      <label>{{ form.controls.text.title }}</label>
      <input [control]="form.controls.text" />
    </div>
    <div>
      <label>{{ form.controls.subgroup.controls.x.title }}</label>
      <input [control]="form.controls.subgroup.controls.x" />
    </div>
    <div>
      <label>{{ form.controls.subgroup.controls.y.title }}</label>
      <input [control]="form.controls.subgroup.controls.y" />
    </div>
    <pre>{{ state.getState() | json }}</pre>`,
  styleUrl: './app.component.css',
  providers: [CounterStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'demo';

  definition = defineGroup<{ a: number }>({ title: 'group' })
    .withControls({
      text: defineStringField({ title: 'pokus', x: 1 }).onUpdate((field) => {
        if (field.disabled) {
          field.setValue(null);
        }
      }),
      subgroup: defineGroup({ title: 'subgroup' })
        .withControls({
          x: defineStringField({ title: 'x' })
            .onUpdate(() => {})
            .validate(() => {}),
          y: defineNumberField({ title: 'y' })
            .onUpdate((x) => {
              if (x.value === 1) {
                x.increment();
              }
            })
            .validate(() => {}),
        })
        .onUpdate((subgroup) => {
          subgroup;
        }),
    })
    .onUpdate((group) => {
      group.controls.subgroup.controls.x;
    });

  state = defineForm('form', this.definition);
  form = this.state.control;

  increment() {
    this.form.setEnabled(!this.form.enabled);
  }

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)['state'] = this.state;
  }
}

// TODO
// zmena name na roznej urovni, napr. zmena poradia riadkov
// merge grup
// validacie
// value ako samostatny objekt v state
// title za name + description

// ROZPRACOVANE
// -
