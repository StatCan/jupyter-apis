import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-volume-mount',
  templateUrl: './mount.component.html',
  styleUrls: ['./mount.component.scss'],
})
export class VolumeMountComponent implements OnInit, OnChanges {
  @Input() volGroup: FormGroup;

  constructor() {}

  ngOnInit(): void {
    this.initComponent();
  }
  ngOnChanges(): void {
    this.initComponent();
  }

  private initComponent(): void{
    // Get the list of mounted volumes of the existing Notebooks in the selected Namespace, AAW

    this.volGroup.get('mount').setValidators([
      Validators.required,
      Validators.pattern(/^(((\/home\/jovyan)((\/)(.)*)?)|((\/opt\/openmpp)((\/)(.)*)?))$/)
    ]);
  }

  showMountPathError() {
    const mountName =this.volGroup.get('mount'); // should this be like the getNameCtrl?
    if (mountName.hasError("pattern")) {
      return $localize `The accepted locations are /home/jovyan, /opt/openmp and any of their subdirectorie`;
    }
  }
}
