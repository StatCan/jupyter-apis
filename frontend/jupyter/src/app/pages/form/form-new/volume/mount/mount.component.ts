import { Component, Input, OnDestroy } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-volume-mount',
  templateUrl: './mount.component.html',
  styleUrls: ['./mount.component.scss'],
})
export class VolumeMountComponent implements OnDestroy {
  @Input() checkDuplicacy: () => void;

  private prvVolGroup: UntypedFormGroup;
  @Input()
  get volGroup(): UntypedFormGroup {
    return this.prvVolGroup;
  }

  set volGroup(volGroup: UntypedFormGroup) {
    this.prvVolGroup = volGroup;
    this.valueChangeSubscription.unsubscribe();
    this.updateMountOnNameChange(volGroup);
  }

  private valueChangeSubscription: Subscription = new Subscription();

  constructor() {}

  ngOnDestroy() {
    this.valueChangeSubscription.unsubscribe();
  }

  updateMountOnNameChange(volGroup: UntypedFormGroup) {
    // If volGroup's parent is a FormArray it means that this component is used
    // in Data volumes else we disable this feature.
    if (!(volGroup.parent instanceof UntypedFormArray)) {
      return;
    }

    if (volGroup.contains('newPvc')) {
      this.updateMountPath(volGroup, this.getNewVolumeNameCtrl(volGroup));
    }

    if (volGroup.contains('existingSource')) {
      this.updateMountPath(
        volGroup,
        volGroup.get('existingSource.persistentVolumeClaim.claimName'),
      );
    }
  }

  updateMountPath(volGroup: UntypedFormGroup, nameCtrl: AbstractControl) {
    const mountPathCtrl = volGroup.get('mount');
    this.valueChangeSubscription = nameCtrl.valueChanges.subscribe(v => {
      const mount = v;
      if (mountPathCtrl.dirty) {
        this.valueChangeSubscription.unsubscribe();
        return;
      }
      volGroup.get('mount').setValue(`/home/jovyan/${mount}`);
    });
  }

  getNewVolumeNameCtrl(volGroup: UntypedFormGroup): AbstractControl {
    const metadata = volGroup.get('newPvc.metadata') as UntypedFormGroup;
    if (metadata.contains('name')) {
      return metadata.get('name');
    }

    if (metadata.contains('generateName')) {
      return metadata.get('generateName');
    }
  }

  showMountPathError() {
    const mountName = this.volGroup.get('mount');

    if (mountName.hasError('required')) {
      return $localize`Mount path is required`;
    }
    if (mountName.hasError('pattern')) {
      return $localize`The accepted locations are /home/jovyan, /opt/openmpp and any of their subdirectorie`;
    }
    if (mountName.hasError('duplicate')) {
      return $localize`This mount path is already in use`;
    }
  }
}
