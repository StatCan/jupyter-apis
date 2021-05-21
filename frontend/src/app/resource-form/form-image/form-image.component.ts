import {Component, OnInit, Input} from "@angular/core";
import {FormGroup, ValidatorFn, AbstractControl} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {Subscription} from "rxjs";

@Component({
  selector: "app-form-image",
  templateUrl: "./form-image.component.html",
  styleUrls: ["./form-image.component.scss", "../resource-form.component.scss"]
})
export class FormImageComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() images: string[];
  @Input() readonly: boolean;
  @Input() hideRegistry: boolean;
  @Input() hideVersion: boolean;
  subscriptions = new Subscription();

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    //Add validator for custom image urls (no http[s]://)
    this.parentForm.get("customImage").setValidators([this.urlValidator()]);

    //disable custom image input when not being used, so errors are ignored
    this.subscriptions.add(
      this.parentForm
        .get("customImageCheck")
        .valueChanges.subscribe((b: boolean) => {
          if (b) {
            this.parentForm.controls.customImage.enable();
          } else {
            this.parentForm.controls.customImage.disable();
          }
        })
    );
  }

  imageDisplayName(image: string): string {
    const [name, version = null] = image.split(":");
    let tokens = name.split("/");

    if (this.hideRegistry && tokens.length > 1 && tokens[0].includes(".")) {
      tokens.shift();
    }
    let displayName = tokens.join("/");

    if (!this.hideVersion && version !== null) {
      displayName = `${displayName}:${version}`;
    }
    return displayName;
  }

  urlValidation(): void {
    const url = this.parentForm.get("customImage");

    if (url.hasError("invalidUrl")) {
      let urlBeginning = "https://";
      const schemeReg = /^http:\/\//i;

      if (schemeReg.test(url.value)) {
        urlBeginning = "http://";
      }

      return this.translate.instant("formImage.errorHttp", {
        scheme: urlBeginning
      });
    }
  }

  private urlValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      const schemeReg = /^http[s]?:\/\//i;
      return schemeReg.test(control.value) ? {invalidUrl: true} : null;
    };
  }
}
