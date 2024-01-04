import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[control]',
  standalone: true,
})
export class InputDirective<TControl> {
  #control: TControl | undefined;

  @Input()
  set control(control: TControl) {
    this.#control = control;
  }

  @HostBinding('disabled')
  get disabled() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.#control as any).disabled;
  }

  @HostBinding('value')
  get value() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.#control as any).value;
  }

  @HostListener('blur', ['$event.target'])
  onBlur(target: HTMLInputElement) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.#control as any).setValue(target.value);
  }
}
