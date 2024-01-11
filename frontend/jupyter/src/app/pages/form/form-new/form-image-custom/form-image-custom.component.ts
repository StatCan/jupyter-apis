import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  LOCALE_ID,
  Inject,
} from '@angular/core';
import {
  UntypedFormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
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
  @Input() parentForm: UntypedFormGroup;
  @Input() images: string[];
  @Input() imagesGroupOne: Config['imageGroupOne'];
  @Input() imagesGroupTwo: Config['imageGroupTwo'];
  @Input() imagesGroupThree: Config['imageGroupThree'];
  @Input() allowCustomImage: boolean;
  @Input() hideRegistry: boolean;
  @Input() hideTag: boolean;
  @Input() nsMetadata: V1Namespace;

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

  onSelect(event: MatCheckboxChange): void {
    if (event.checked) {
      this.parentForm.get('image').disable();
      this.parentForm.get('imageGroupOne').disable();
      this.parentForm.get('imageGroupTwo').disable();
      this.parentForm.get('imageGroupThree').disable();
    } else {
      this.parentForm.get('image').enable();
      this.parentForm.get('imageGroupOne').enable();
      this.parentForm.get('imageGroupTwo').enable();
      this.parentForm.get('imageGroupThree').enable();
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

  shouldEnable(enabledCondition: { labels: Map<string, string> }): boolean {
    if (enabledCondition == null || this.nsMetadata == null) {
      return true;
    }

    const conditionLabels = Object.entries(enabledCondition.labels);
    const namespaceLabelMetadata = (this.nsMetadata.metadata || {}).labels;
    for (const [key, val] of conditionLabels) {
      if (namespaceLabelMetadata[key] !== val) {
        return false;
      }
    }
    return true;
  }

  getDisabledMessage(serverType: string): string {
    // Get the current browser language, if the error message isn't given in that language (in the config),
    // return the default disabled message
    const currentLanguage = this.localeId;

    const msg = {
      'group-one': this.imagesGroupOne.disabledMessage,
      'group-two': this.imagesGroupTwo.disabledMessage,
      'group-three': this.imagesGroupThree.disabledMessage,
    };

    const disabledMsg = msg[serverType] || {};
    const message = disabledMsg[currentLanguage];

    if (typeof message == 'string') {
      return message;
    }

    return $localize`This workspace type is disabled for profile "${this.nsMetadata.metadata.name}".`;
  }
}
