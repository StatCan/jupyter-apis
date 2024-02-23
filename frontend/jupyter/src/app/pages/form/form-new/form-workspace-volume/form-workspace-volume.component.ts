import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SnackBarService } from 'kubeflow';

import { FormGroup } from '@angular/forms';
import {
  createExistingSourceFormGroup,
  createNewPvcFormGroup,
  getNewVolumeSize,
  getNewVolumeType,
  getVolumeName,
  getVolumeTitle,
} from 'src/app/shared/utils/volumes';

@Component({
  selector: 'app-form-workspace-volume',
  templateUrl: './form-workspace-volume.component.html',
  styleUrls: ['./form-workspace-volume.component.scss'],
})
export class FormWorkspaceVolumeComponent implements OnDestroy {
  panelOpen = false;
  subscriptions = new Subscription();
  getVolumeTitle = getVolumeTitle;

  getVolumeName = getVolumeName;
  getNewVolumeSize = getNewVolumeSize;
  getNewVolumeType = getNewVolumeType;

  @Input() readonly: boolean;
  @Input() volGroup: FormGroup;
  @Input() externalName: string;
  @Input() mountedVolumes: Set<string>;

  constructor(private snackBar: SnackBarService) {}

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.snackBar.close();
  }

  onDelete(event: PointerEvent) {
    event.stopPropagation();
    this.removeVolumeFields(this.volGroup);
    this.volGroup.disable();
    this.panelOpen = false;
  }

  addNewVolume() {
    this.volGroup.addControl('newPvc', createNewPvcFormGroup());
    this.volGroup.get('mount').setValue('/home/jovyan');
    this.volGroup.enable();
    this.volGroup.get('newPvc.spec.storageClassName').disable();
  }

  attachExistingVolume() {
    this.volGroup.addControl('existingSource', createExistingSourceFormGroup());
    this.volGroup.get('mount').setValue('/home/jovyan');
    this.volGroup.enable();
    this.panelOpen = true;
  }

  private removeVolumeFields(vol: FormGroup) {
    if (vol.get('newPvc')) {
      vol.removeControl('newPvc');
    }

    if (vol.get('existingSource')) {
      vol.removeControl('existingSource');
    }
  }
}
