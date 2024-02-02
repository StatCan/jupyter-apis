import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { TolerationGroup, AffinityConfig } from 'src/app/types';

@Component({
  selector: 'app-form-affinity-tolerations',
  templateUrl: './form-affinity-tolerations.component.html',
  styleUrls: ['./form-affinity-tolerations.component.scss'],
})
export class FormAffinityTolerationsComponent {
  @Input() parentForm: UntypedFormGroup;
  @Input() tolerationGroups: TolerationGroup[];
  @Input() affinityConfigs: AffinityConfig[];

  constructor() {}
}
