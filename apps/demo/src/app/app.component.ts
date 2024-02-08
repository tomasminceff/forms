import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CounterStore } from './app.component.store';
import { CommonModule } from '@angular/common';
import {
  GetGroupControlsValue,
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
  styles: [':host { display: flex; column-gap: 50px; }'],
  template: `
    <pre>{{ state.getState() | json }}</pre>
    <pre>{{ form | json }}</pre>
    <div>
      <div>
        <label>{{ form.controls.text.title }}</label>
        <input [control]="form.controls.text" />
      </div>
      <div>
        <label>{{ form.controls.subgroup.controls.string.title }}</label>
        <input [control]="form.controls.subgroup.controls.string" />
      </div>
      <div>
        <label>{{ form.controls.subgroup.controls.number.title }}</label>
        <input [control]="form.controls.subgroup.controls.number" />
      </div>
      <div><button (click)="increment()">Press me</button></div>
    </div>
  `,
  styleUrl: './app.component.css',
  providers: [CounterStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'demo';

  definition = defineGroup<{ a: number }>({ title: 'group' })
    .withControls({
      text: defineStringField({ title: 'string', x: 1 }).onUpdate((field) => {
        if (field.disabled) {
          field.setValue(null);
        }
      }),
      subgroup: defineGroup({ title: 'subgroup' })
        .withControls({
          string: defineStringField({ title: 'subgroup string' })
            .onUpdate(() => {})
            .validate(() => {}),
          number: defineNumberField({ title: 'subgroup number' })
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
      group.controls.subgroup.controls.string;
    });

  state = defineForm('form', this.definition);
  form = this.state.control;
  x = this.definition.control.controls.subgroup.controls.number;

  increment() {
    this.form.setEnabled(!this.form.enabled);
  }

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)['state'] = this.state;
  }
}

// BUGFIX

// TODO
// form stabilizuje stav tak, aby to nebolo rekurzivne - ze si pocka na posledne zmeny a az potom znovu spusti onUpdate
// optional group
// zmena name na roznej urovni, napr. zmena poradia riadkov
// merge grup
// validacie
// value ako samostatny objekt v state
// title za name + description

// ROZPRACOVANE
// -
