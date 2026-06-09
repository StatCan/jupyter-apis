import { Component, Input } from '@angular/core';
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
export class FormDataVolumesComponent {
  @Input() volsArray: FormArray;
  @Input() readonly: boolean;
  @Input() externalName: string;
  @Input() mountedVolumes: Set<string>;
  newIndex = 0;
  activeIndex: number | null = 0; // Keep track of the open panel
  getVolumeTitle = getVolumeTitle;
  getVolumeName = getVolumeName;
  getNewVolumeSize = getNewVolumeSize;
  getNewVolumeType = getNewVolumeType;

  constructor() {}

  onDelete(id: number, event: PointerEvent) {
    event.stopPropagation();
    this.volsArray.removeAt(id);
    this.volsArray.controls.forEach((v, i) => {
      (v as FormGroup).get('mount').updateValueAndValidity();
    });

     // Adjust activeIndex if needed
    if (this.activeIndex === id) {
      this.activeIndex = null; // Close if removed
    } else if (this.activeIndex !== null && id < this.activeIndex) {
      this.activeIndex--; // Shift index if a panel before it was removed
    }
  }

  addNewVolume() {
    this.newIndex++;
    const volId = this.volsArray.length;
    const volGroup = createNewPvcVolumeFormGroup(
      `{notebook-name}-datavol-${volId}`,
    );

    this.volsArray.push(volGroup);

    volGroup.get('mount').setValue(`/home/jovyan/vol-${this.newIndex}`);
    volGroup.get('mount').markAsTouched();
    this.openMe(volId);

  }

  attachExistingVolume() {
    this.newIndex++;
    const volGroup = createExistingVolumeFormGroup();

    this.volsArray.push(volGroup);

    volGroup.get('mount').setValue(`/home/jovyan/vol-${this.newIndex}`);
  }

  checkDuplicacy(index: number) {
    this.volsArray.controls.forEach((v, i) => {
      if (index !== i) {
        (v as FormGroup).get('mount').updateValueAndValidity();
      }
    });
  }

  openMe(id: number) {
    this.activeIndex = id;
  }

  closeMe(id: number) {
    if (this.activeIndex == id) {
      this.activeIndex = null;
    }
  }

  showActiveIcon(id: number) {
    if (this.activeIndex == id) {
      return true;
    }
    return false;
  }
}
