import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, Validators, FormBuilder } from '@angular/forms';
import { notebook } from 'cypress/fixtures/notebook';
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
  }

  addNewVolume() {
    const volId = this.volsArray.length + 1;
    //console.log(notebook.name); // const test-notebook
    // console.log(`{notebook-name}`); // just prints out {notebook-name}, i don't even think that this way of getting the value works
    //console.log(`{DOESNTEXIST}`);
    // this is not getting `notebook-name` properly cannot pass it down, it gets ${volId} just fine, oh because its here...
    const actualName = '{notebook-name}';
    console.log(actualName);
    const volGroup = createNewPvcVolumeFormGroup(
    //const volGroup = createNewPvcFormGroup(
      //`{notebook-name}-datavol-${volId}`, //this is what needs to work, somwhow {notebook-name} is evaluating to an object
      actualName+`-datavol-${volId}` // it will flash as {notebook-name} for a second and then go to object
      // huh even if you dont pass anything down it gives object object
      //`{DOESNTEXIST}-datavol-${volId}`, // this gives out {DOESNTEXIST}-datavol-1
    );

    this.volsArray.push(volGroup);

    volGroup.get('mount').setValue(`/home/jovyan/vol-${this.volsArray.length}`);
  }

  attachExistingVolume() {
    const volGroup = createExistingVolumeFormGroup();

    this.volsArray.push(volGroup);

    volGroup.get('mount').setValue(`/home/jovyan/vol-${this.volsArray.length}`);
  }
}
