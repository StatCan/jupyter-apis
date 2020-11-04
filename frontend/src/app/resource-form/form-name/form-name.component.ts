import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import {
  FormGroup,
  ValidatorFn,
  AbstractControl,
  Validators
} from "@angular/forms";
import { KubernetesService } from "src/app/services/kubernetes.service";
import { NamespaceService } from "src/app/services/namespace.service";
import { Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-form-name",
  templateUrl: "./form-name.component.html",
  styleUrls: ["./form-name.component.scss", "../resource-form.component.scss"]
})
export class FormNameComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  notebooks: Set<string> = new Set<string>();
  @Input() parentForm: FormGroup;

  constructor(
    private k8s: KubernetesService, 
    private ns: NamespaceService,
    private translate: TranslateService) {}

  ngOnInit() {
    // Add validator for notebook name (existing name, length, lowercase alphanumeric and '-')
    this.parentForm
      .get("name")
      .setValidators([Validators.required, this.existingNameValidator(), Validators.pattern(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/), Validators.maxLength(52)]);
    
    // Keep track of the existing Notebooks in the selected Namespace
    // Use these names to check if the input name exists
    const nsSub = this.ns.getSelectedNamespace().subscribe(ns => {
      this.k8s.getResource(ns).subscribe(notebooks => {
        this.notebooks.clear();
        notebooks.map(nb => this.notebooks.add(nb.name));
      });
    });

    this.subscriptions.add(nsSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  showNameError() {
    const nameCtrl = this.parentForm.get("name");
    
    if (nameCtrl.value.length==0) {
      return this.translate.instant("formName.errorNameRequired");
    }
    if (nameCtrl.hasError("existingName")) {
      return this.translate.instant("formName.errorNameExists", {existingName: `${nameCtrl.value}`});
    }
    if (nameCtrl.hasError("pattern")) {
      return this.translate.instant("formName.errorNamePattern");
    } 
    if (nameCtrl.hasError("maxlength")) {
      return this.translate.instant("formName.errorNameMaxLenght");
    }
  }

  private existingNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const exists = this.notebooks.has(control.value);
      return exists ? { existingName: true } : null;
    };
  }
  
}
