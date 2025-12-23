import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  LOCALE_ID,
  Inject,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '@app/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { V1Namespace } from '@kubernetes/client-node';
import { Config } from 'src/app/types';

@Component({
  selector: 'app-form-image',
  templateUrl: './form-image.component.html',
  styleUrls: ['./form-image.component.scss'],
})
export class FormImageComponent implements OnInit, OnDestroy {
  @Input() parentForm: FormGroup;
  @Input() images: string[];
  @Input() imagesGroupThree: Config['imageGroupThree'];
  @Input() allowCustomImage: boolean;
  @Input() hideRegistry: boolean;
  @Input() hideTag: boolean;

  subs = new Subscription();

  constructor(
    @Inject(LOCALE_ID) public localeId: string,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIcon(
      'jupyter-icon',
      sanitizer.bypassSecurityTrustResourceUrl(environment.jupyterIcon),
    );
    iconRegistry.addSvgIcon(
      'group-one',
      sanitizer.bypassSecurityTrustResourceUrl(environment.groupOneIcon),
    );
    iconRegistry.addSvgIcon(
      'group-two',
      sanitizer.bypassSecurityTrustResourceUrl(environment.groupTwoIcon),
    );
    iconRegistry.addSvgIcon(
      'sas',
      sanitizer.bypassSecurityTrustResourceUrl(environment.groupThreeIcon),
    );
  }

  ngOnInit() {
    this.subs.add(
      this.parentForm.get('customImageCheck').valueChanges.subscribe(check => {
        // Make sure that the use will insert and Image value
        if (check) {
          this.parentForm
            .get('customImage')
            .setValidators([this.urlValidator(), Validators.required]);
          this.parentForm.get('image').setValidators([]);
          this.parentForm.get('imageGroupThree').setValidators([]);
        }
        this.parentForm.get('serverType').valueChanges.subscribe(selection => {
          if (selection === 'jupyter') {
            this.parentForm
              .get('customImage')
              .setValidators([this.urlValidator(), Validators.required]); //AAW
            this.parentForm.get('image').setValidators(Validators.required);
            this.parentForm.get('imageGroupThree').setValidators([]);
          } else if (selection === 'group-one') {
            this.parentForm
              .get('customImage')
              .setValidators([this.urlValidator(), Validators.required]); //AAW
            this.parentForm.get('image').setValidators([]);
            this.parentForm.get('imageGroupThree').setValidators([]);
          } else if (selection === 'group-two') {
            this.parentForm
              .get('customImage')
              .setValidators([this.urlValidator(), Validators.required]); //AAW
            this.parentForm.get('image').setValidators([]);
            this.parentForm.get('imageGroupThree').setValidators([]);
          } else if (selection === 'sas') {
            this.parentForm.get('image').setValidators([]);
            this.parentForm
              .get('imageGroupThree')
              .setValidators(Validators.required);
          }
          this.parentForm.get('image').updateValueAndValidity();
          this.parentForm.get('imageGroupThree').updateValueAndValidity();
        });
        this.parentForm.get('customImage').updateValueAndValidity();
        this.parentForm.get('serverType').updateValueAndValidity();
      }),
    );
  }

  private urlValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const schemeReg = /^http[s]?:\/\//i;
      return schemeReg.test(control.value) ? { invalidUrl: true } : null;
    };
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
