import { Component, OnInit, Input, OnDestroy, LOCALE_ID, Inject } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
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
  @Input() imagesGroupOne: Config["imageGroupOne"];
  @Input() imagesGroupTwo: Config["imageGroupTwo"];
  @Input() imagesGroupThree: Config["imageGroupThree"];
  @Input() allowCustomImage: boolean;
  @Input() hideRegistry: boolean;
  @Input() hideTag: boolean;
  @Input() nsMetadata: V1Namespace; 

  subs = new Subscription();

  constructor(@Inject(LOCALE_ID) public localeId: string, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
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
    iconRegistry.addSvgIcon(
      'group-three',
      sanitizer.bypassSecurityTrustResourceUrl(environment.groupThreeLogo),
    );
  }

  ngOnInit() {
    this.subs.add(
      this.parentForm.get('customImageCheck').valueChanges.subscribe(check => {
        // Make sure that the use will insert and Image value
        if (check) {
          this.parentForm.get('customImage').setValidators(Validators.required);
          this.parentForm.get('image').setValidators([]);
          this.parentForm.get('imageGroupOne').setValidators([]);
          this.parentForm.get('imageGroupTwo').setValidators([]);
          this.parentForm.get('imageGroupThree').setValidators([]);
        }
        this.parentForm.get('serverType').valueChanges.subscribe(selection => {
          if (selection === 'jupyter') {
            this.parentForm.get('customImage').setValidators([]);
            this.parentForm.get('image').setValidators(Validators.required);
            this.parentForm.get('imageGroupOne').setValidators([]);
            this.parentForm.get('imageGroupTwo').setValidators([]);
            this.parentForm.get('imageGroupThree').setValidators([]);
          } else if (selection === 'group-one') {
            this.parentForm.get('customImage').setValidators([]);
            this.parentForm.get('image').setValidators([]);
            this.parentForm
              .get('imageGroupOne')
              .setValidators(Validators.required);
            this.parentForm.get('imageGroupTwo').setValidators([]);
            this.parentForm.get('imageGroupThree').setValidators([]);
          } else if (selection === 'group-two') {
            this.parentForm.get('customImage').setValidators([]);
            this.parentForm.get('image').setValidators([]);
            this.parentForm.get('imageGroupOne').setValidators([]);
            this.parentForm
              .get('imageGroupTwo')
              .setValidators(Validators.required);
            this.parentForm.get('imageGroupThree').setValidators([]);
          } else if (selection === 'group-three') {
            this.parentForm.get('image').setValidators([]);
            this.parentForm.get('imageGroupOne').setValidators([]);
            this.parentForm.get('imageGroupTwo').setValidators([]);
            this.parentForm
              .get('imageGroupThree')
              .setValidators(Validators.required);
          }
          this.parentForm.get('image').updateValueAndValidity();
          this.parentForm.get('imageGroupOne').updateValueAndValidity();
          this.parentForm.get('imageGroupTwo').updateValueAndValidity();
          this.parentForm.get('imageGroupThree').updateValueAndValidity();
        });
        this.parentForm.get('customImage').updateValueAndValidity();
        this.parentForm.get('serverType').updateValueAndValidity();
      }),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  imageDisplayName(image: string): string {
    const [name, tag = null] = image.split(':');
    let tokens = name.split('/');

    if (this.hideRegistry && tokens.length > 1 && tokens[0].includes('.')) {
      tokens.shift();
    }

    let displayName = tokens.join('/');

    if (!this.hideTag && tag !== null) {
      displayName = `${displayName}:${tag}`;
    }

    return displayName;
  }

  shouldEnable(imageGroup: Map<string, string>): boolean {
    if (imageGroup == null || this.nsMetadata == null) {
      return true;
    }

    const conditionLabels = Object.entries(imageGroup["labels"]);
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
    const currentLanguage =  this.localeId;

    var msg = {
      'group-one': this.imagesGroupOne.disabledMessage, 
      'group-two': this.imagesGroupTwo.disabledMessage, 
      'group-three': this.imagesGroupThree.disabledMessage
    }; 

    const disabledMsg = msg[serverType] || {};
    const message = disabledMsg[currentLanguage]

    if (typeof(message) == 'string') {
      return message;
    }

    return $localize`This workspace type is disabled for profile "${this.nsMetadata.metadata.name}".`
  }
}
