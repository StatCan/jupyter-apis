import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import {
  createExistingVolumeFormGroup,
  createNewPvcVolumeFormGroup,
  getNewVolumeSize,
  getNewVolumeType,
  getVolumeName,
  getVolumeTitle,
} from 'src/app/shared/utils/volumes';

@Component({
  selector: 'app-form-data-volumes',
  templateUrl: './form-data-volumes.component.html',
  styleUrls: ['./form-data-volumes.component.scss'],
})
export class FormDataVolumesComponent implements OnInit {
  openPanel = new Set();

  @Input() volsArray: FormArray;
  @Input() readonly: boolean;
  @Input() externalName: string;
  @Input() mountedVolumes: Set<string>;
  newestItem = 0;

  getVolumeTitle = getVolumeTitle;
  getVolumeName = getVolumeName;
  getNewVolumeSize = getNewVolumeSize;
  getNewVolumeType = getNewVolumeType;

  constructor() {}

  ngOnInit() {}

  onDelete(id: number, event: PointerEvent) {
    event.stopPropagation();
    this.volsArray.removeAt(id);
    this.openPanel.clear();
    this.volsArray.controls.forEach((v, i) => {
      (v as FormGroup).get('mount').updateValueAndValidity();
    });
  }

  addNewVolume() {
    const volId = this.volsArray.length + 1;
    const volGroup = createNewPvcVolumeFormGroup(
      `{notebook-name}-datavol-${volId}`,
    );

    this.volsArray.push(volGroup);

    volGroup.get('mount').setValue(`/home/jovyan/vol-${this.volsArray.length}`);
    volGroup.get('mount').markAsTouched();
    this.newestItem = volId;
  }

  attachExistingVolume() {
    const volGroup = createExistingVolumeFormGroup();

    this.volsArray.push(volGroup);

    volGroup.get('mount').setValue(`/home/jovyan/vol-${this.volsArray.length}`);
  }

  checkDuplicacy(index: number) {
    this.volsArray.controls.forEach((v, i) => {
      if (index !== i) {
        (v as FormGroup).get('mount').updateValueAndValidity();
      }
    });
  }
}
