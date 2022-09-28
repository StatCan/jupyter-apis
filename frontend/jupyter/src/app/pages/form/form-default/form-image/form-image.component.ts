import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '@app/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-form-image',
  templateUrl: './form-image.component.html',
  styleUrls: ['./form-image.component.scss'],
})
export class FormImageComponent implements OnInit, OnDestroy {
  @Input() parentForm: FormGroup;
  @Input() images: string[];
  @Input() imagesGroupOne: string[];
  @Input() imagesGroupTwo: string[];
  @Input() allowCustomImage: boolean;
  @Input() hideRegistry: boolean;
  @Input() hideTag: boolean;

  subs = new Subscription();

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'jupyterlab',
      sanitizer.bypassSecurityTrustResourceUrl(environment.jupyterlabLogo),
    );
    iconRegistry.addSvgIcon(
      'group-one',
      sanitizer.bypassSecurityTrustResourceUrl(environment.groupOneLogo),
    );
    iconRegistry.addSvgIcon(
      'group-two',
      sanitizer.bypassSecurityTrustResourceUrl(environment.groupTwoLogo),
    );
  }

  ngOnInit() {
    this.subs.add(
      this.parentForm.get('customImageCheck').valueChanges.subscribe(check => {
        //disable custom image input when not being used, so errors are ignored
        this.parentForm.get("customImageCheck")
        .valueChanges.subscribe((b: boolean) => {
          if (b) {
            this.parentForm.controls.customImage.enable();
          } else {
            this.parentForm.controls.customImage.disable();
          }
        })
        // Make sure that the use will insert and Image value
        if (check) {
          this.parentForm.get('customImage').setValidators([this.urlValidator(),Validators.required]);
          this.parentForm.get('image').setValidators([]);
          this.parentForm.get('imageGroupOne').setValidators([]);
          this.parentForm.get('imageGroupTwo').setValidators([]);
        }
        this.parentForm.get('serverType').valueChanges.subscribe(selection => {
          if (selection === 'jupyter') {
            this.parentForm.get('customImage').setValidators([this.urlValidator(),Validators.required]); //AAW
            this.parentForm.get('image').setValidators(Validators.required);
            this.parentForm.get('imageGroupOne').setValidators([]);
            this.parentForm.get('imageGroupTwo').setValidators([]);
          } else if (selection === 'group-one') {
            this.parentForm.get('customImage').setValidators([this.urlValidator(),Validators.required]); //AAW
            this.parentForm.get('image').setValidators([]);
            this.parentForm
              .get('imageGroupOne')
              .setValidators(Validators.required);
            this.parentForm.get('imageGroupTwo').setValidators([]);
          } else if (selection === 'group-two') {
            this.parentForm.get('customImage').setValidators([this.urlValidator(),Validators.required]); //AAW
            this.parentForm.get('image').setValidators([]);
            this.parentForm.get('imageGroupOne').setValidators([]);
            this.parentForm
              .get('imageGroupTwo')
              .setValidators(Validators.required);
          }
          this.parentForm.get('image').updateValueAndValidity();
          this.parentForm.get('imageGroupOne').updateValueAndValidity();
          this.parentForm.get('imageGroupTwo').updateValueAndValidity();
        });
        this.parentForm.get('customImage').updateValueAndValidity();
        this.parentForm.get('serverType').updateValueAndValidity();
      }),
    );
  }

  urlValidation(): string {
    const url = this.parentForm.get("customImage");

    if (url.hasError("invalidUrl")) {
      let urlBeginning = "https://";
      const schemeReg = /^http:\/\//i;

      if (schemeReg.test(url.value)) {
        urlBeginning = "http://";
      }

      return `${ urlBeginning } is not allowed in URLs, to TRANSLATE`;
    }
  }

  private urlValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      const schemeReg = /^http[s]?:\/\//i;
      return schemeReg.test(control.value) ? {invalidUrl: true} : null;
    };
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  imageDisplayName(image: string): string {
    const [name, tag = null] = image.split(":");
    let tokens = name.split("/");

    if (this.hideRegistry && tokens.length > 1 && tokens[0].includes(".")) {
      tokens.shift();
    }

    let displayName = tokens.join("/");

    if (!this.hideTag && tag !== null) {
      displayName = `${displayName}:${tag}`;
    }

    return displayName;
  }
}
