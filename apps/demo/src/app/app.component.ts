import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CounterStore } from './app.component.store';
import { CommonModule } from '@angular/common';
import {
  InputDirective,
  defineField,
  defineForm,
  defineGroup,
} from '@org/forms';

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, InputDirective],
  selector: 'org-root',
  template: `<button (click)="increment()">Press me</button>
    <pre>{{ form | json }}</pre>
    <label>{{ form.controls.text.title }}</label>
    <input [control]="form.controls.text" />
    <pre>{{ state.getState() | json }}</pre>`,
  styleUrl: './app.component.css',
  providers: [CounterStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'demo';

  definition = defineGroup<{ a: number }>({ title: 'group' })
    .withControls({
      text: defineField({ title: 'pokus', x: 1 }).onUpdate((field) => {
        if (field.disabled) {
          field.setValue(null);
        }
      }),
      subgroup: defineGroup({ title: 'subgroup' })
        .withControls({
          x: defineField({ title: 'x' })
            .onUpdate((x) => {
              x;
            })
            .validate(),
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
}

// TODO
// zmena name na roznej urovni, napr. zmena poradia riadkov
// merge grup
// validacie
// value ako samostatny objekt v state
// title za name + description

// ROZPRACOVANE
// -
