import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAX_NAME_LENGTH } from '../validators';

@Component({
  selector: 'lib-form-name-namespace-inputs',
  templateUrl: './name-namespace-inputs.component.html',
  styleUrls: ['./name-namespace-inputs.component.scss'],
})
export class NameNamespaceInputsComponent {
  @Input()
  nameControl: FormControl<string | null>;

  @Input()
  namespaceControl: FormControl<string | null>;

  @Input()
  resourceName: string;

  @Input()
  maxLength = MAX_NAME_LENGTH;

  @Input()
  existingNames: Set<string>;

  constructor() {}
}
