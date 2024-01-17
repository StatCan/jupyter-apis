import { HttpHeaders } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { SnackBarService, SnackType } from 'kubeflow';
import { setGenerateNameCtrl } from 'src/app/shared/utils/volumes';

@Component({
  selector: 'app-rok-url',
  templateUrl: './rok-url.component.html',
  styleUrls: ['./rok-url.component.scss'],
})
export class RokUrlComponent {
  @Input() volGroup: UntypedFormGroup;

  constructor(private snack: SnackBarService) {}

  public autofillRokVolume(headers: HttpHeaders) {
    const name =
      headers.get('X-Object-Meta-workspace') ||
      headers.get('X-Object-Meta-dataset') ||
      headers.get('x-object-meta-pvc');

    let size = parseInt(headers.get('Content-Length'), 10);
    size = size / Math.pow(1024, 3);

    const path = headers.get('X-Object-Meta-mountpoint');

    const pvcGroup = this.volGroup.get('newPvc') as UntypedFormGroup;
    pvcGroup.get('spec.resources.requests.storage').setValue(`${size}Gi`);
    this.volGroup.get('mount').setValue(path);

    // ensure we use generateName
    const meta = this.volGroup.get('newPvc.metadata') as UntypedFormGroup;
    setGenerateNameCtrl(meta, `${name}-`);

    this.snack.open(
      'Volume was autofilled successfully.',
      SnackType.Success,
      3000,
    );
  }
}
