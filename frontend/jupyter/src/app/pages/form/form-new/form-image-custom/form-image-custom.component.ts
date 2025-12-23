import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  LOCALE_ID,
  Inject,
} from '@angular/core';
import { FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { V1Namespace } from '@kubernetes/client-node';
import { Config } from 'src/app/types';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-form-image-custom',
  templateUrl: './form-image-custom.component.html',
  styleUrls: ['./form-image-custom.component.scss'],
})
export class FormImageCustomComponent implements OnInit, OnDestroy {
  @Input() parentForm: FormGroup;
  @Input() images: string[];
  @Input() imagesSas: Config['imageSas'];
  @Input() allowCustomImage: boolean;
  @Input() hideRegistry: boolean;
  @Input() hideTag: boolean;

  subs = new Subscription();

  constructor(
    @Inject(LOCALE_ID) public localeId: string,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.subs.add(
      this.parentForm.get('customImageCheck').valueChanges.subscribe(check => {
        //disable custom image input when not being used, so errors are ignored
        this.parentForm
          .get('customImageCheck')
          .valueChanges.subscribe((b: boolean) => {
            if (b) {
              this.parentForm.controls.customImage.enable();
            } else {
              this.parentForm.controls.customImage.disable();
            }
          });
      }),
    );
  }

  toggleImageInput(flag: boolean): void {
    if (flag) {
      this.parentForm.get('image').enable();
      this.parentForm.get('imageSas').enable();
    } else {
      this.parentForm.get('image').disable();
      this.parentForm.get('imageSas').disable();
    }
  }

  onSelect(event: MatCheckboxChange): void {
    if (event.checked) {
      this.toggleImageInput(false);

      // uncheck the beta box if checking the custom image box
      if (this.parentForm.get('betaImageCheck').value === true) {
        this.parentForm.get('betaImageCheck').setValue(false);
      }
    } else {
      this.toggleImageInput(true);
    }
  }

  onSelectBeta(event: MatCheckboxChange): void {
    // uncheck the custom image box if checking the beta box
    if (
      event.checked &&
      this.parentForm.get('customImageCheck').value === true
    ) {
      this.parentForm.get('customImageCheck').setValue(false);

      //to replicate behavior of customImageCheck being unchecked
      this.toggleImageInput(true);
    }
  }

  urlValidation(): string {
    const url = this.parentForm.get('customImage');

    if (url.hasError('required')) {
      return $localize`Custom image is required`;
    }
    if (url.hasError('invalidUrl')) {
      let urlBeginning = 'https://';
      const schemeReg = /^http:\/\//i;

      if (schemeReg.test(url.value)) {
        urlBeginning = 'http://';
      }

      return $localize`${urlBeginning} is not allowed in URLs`;
    }
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

  imageDisplayName(image: string): string {
    const [name, tag = null] = image.split(':');
    const tokens = name.split('/');

    if (this.hideRegistry && tokens.length > 1 && tokens[0].includes('.')) {
      tokens.shift();
    }

    let displayName = tokens.join('/');

    if (!this.hideTag && tag !== null) {
      displayName = `${displayName}:${tag}`;
    }

    return displayName;
  }
}
