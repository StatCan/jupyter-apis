import { Component, Input, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-volume-mount',
  templateUrl: './mount.component.html',
  styleUrls: ['./mount.component.scss'],
})
export class VolumeMountComponent implements OnDestroy {
  private prvVolGroup: FormGroup;
  @Input()
  get volGroup(): FormGroup {
    return this.prvVolGroup;
  }

  set volGroup(volGroup: FormGroup) {
    this.prvVolGroup = volGroup;
    this.prvVolGroup
      .get('mount')
      .setValidators([
        Validators.required,
        Validators.pattern(
          /^(((\/home\/jovyan)((\/)(.)*)?)|((\/opt\/openmpp)((\/)(.)*)?))$/,
        ),
      ]);
    this.valueChangeSubscription.unsubscribe();
    this.updateMountOnNameChange(volGroup);
  }

  private valueChangeSubscription: Subscription = new Subscription();

  constructor() {}

  ngOnDestroy() {
    this.valueChangeSubscription.unsubscribe();
  }

  updateMountOnNameChange(volGroup: FormGroup) {
    // If volGroup's parent is a FormArray it means that this component is used
    // in Data volumes else we disable this feature.
    if (!(volGroup.parent instanceof FormArray)) {
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

  updateMountPath(volGroup: FormGroup, nameCtrl: AbstractControl) {
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

  getNewVolumeNameCtrl(volGroup: FormGroup): AbstractControl {
    const metadata = volGroup.get('newPvc.metadata') as FormGroup;
    if (metadata.contains('name')) {
      return metadata.get('name');
    }

    if (metadata.contains('generateName')) {
      return metadata.get('generateName');
    }
  }

  showMountPathError() {
    const mountName = this.volGroup.get('mount'); // should this be like the getNameCtrl?
    if (mountName.hasError('required')) {
      return $localize`Mount path is required`;
    }
    if (mountName.hasError('pattern')) {
      return $localize`The accepted locations are /home/jovyan, /opt/openmpp and any of their subdirectorie`;
    }
  }
}
