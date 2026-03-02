import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  AfterContentChecked,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Config, NotebookEditFormObject } from 'src/app/types';
import { Subscription } from 'rxjs';
import {
  NamespaceService,
  SnackBarConfig,
  SnackBarService,
  SnackType,
} from 'kubeflow';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getEditFormDefaults,
  initEditFormControls,
  setConfigForNotebook,
} from './utils';
import { JWABackendService } from 'src/app/services/backend.service';

import { environment } from '@app/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-form-edit',
  templateUrl: './form-edit.component.html',
  styleUrls: ['./form-edit.component.scss'],
})
export class FormEditComponent
  implements OnInit, OnDestroy, AfterContentChecked
{
  namespace: string;
  notebookName: string;
  notebookImage: string;
  notebookImageType: string;
  notebookInfoLoaded: boolean = false;

  formCtrl: FormGroup;
  config: Config;

  notebooksub = new Subscription();
  namespaceSub = new Subscription();

  mountedVolumes: Set<string> = new Set<string>();
  existingNotebooks: Set<string> = new Set<string>();
  constructor(
    public namespaceService: NamespaceService,
    public backend: JWABackendService,
    public router: Router,
    public snackbar: SnackBarService,
    public cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    public iconRegistry: MatIconRegistry,
    public sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIcon(
      'jupyter-icon',
      sanitizer.bypassSecurityTrustResourceUrl(environment.jupyterIcon),
    );
    iconRegistry.addSvgIcon(
      'sas-icon',
      sanitizer.bypassSecurityTrustResourceUrl(environment.sasIcon),
    );
  }

  ngOnInit(): void {
    // Initialize the form control
    this.formCtrl = getEditFormDefaults();

    // Get form configs
    // ZONE: this.config is only needed for LimitFactor values for cpu and memory.
    // ZONE: If we get rid of LimitFactor, then get rid of this and just call the notebook data
    this.backend.getConfig().subscribe(config => {
      if (Object.keys(config).length === 0) {
        // Don't fire on empty config
        return;
      }

      this.config = config;

      // Get notebook data
      this.route.params.subscribe(params => {
        this.namespaceService.updateSelectedNamespace(params.namespace);
        this.notebookName = params.notebookName;
        this.namespace = params.namespace;

        this.notebooksub = this.backend
          .getNotebook(params.namespace, params.notebookName)
          .subscribe(nb => {
            // Return if notebook has no containers
            if (!nb?.spec?.template?.spec?.containers) {
              // Notebooks should always have at least one container
              return;
            }

            for (const cn of nb.spec.template.spec.containers) {
              // Skip container if it's not the main notebook container
              if (cn.name !== nb.metadata.name) {
                continue;
              }

              this.notebookImage = cn.image;
              this.notebookImageType =
                nb.metadata.annotations['notebooks.kubeflow.org/server-type'];

              // Initialize form controls with notebook values
              setConfigForNotebook(nb, this.config);
              break;
            }

            initEditFormControls(this.formCtrl, this.config);

            // Get mounted volumes from namespace
            this.backend.getNotebooks(params.namespace).subscribe(notebooks => {
              this.mountedVolumes.clear();
              notebooks.map(nb => {
                //Only look for volumes from other notebooks
                if (nb.name !== params.notebookName) {
                  return nb.volumes.map(v => {
                    this.mountedVolumes.add(v);
                  });
                }
              });
            });

            this.notebookInfoLoaded = true;
          });
      });
    });

    // Setup subscriptions
    this.namespaceSub.add(
      // If namespace changes, return to default route
      this.namespaceService.getSelectedNamespace().subscribe(namespace => {
        if (this.namespace && this.namespace !== namespace) {
          this.router.navigate(['/']);
        }
      }),
    );
  }

  ngOnDestroy() {
    // Unsubscriptions
    this.notebooksub.unsubscribe();
    this.namespaceSub.unsubscribe();
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  getSubmitNotebook(): NotebookEditFormObject {
    const notebookCopy = this.formCtrl.value as NotebookEditFormObject;
    const notebook = JSON.parse(JSON.stringify(notebookCopy));

    notebook.name = this.notebookName;
    notebook.namespace = this.namespace;

    // Ensure CPU input is a string
    if (typeof notebook.cpu === 'number') {
      notebook.cpu = notebook.cpuLimit = notebook.cpu.toString();
    }

    // Add Gi to all sizes
    if (notebook.memory) {
      notebook.memory = notebook.memoryLimit =
        notebook.memory.toString() + 'Gi';
    }

    for (const vol of notebook.datavols) {
      if (vol.size) {
        vol.size = vol.size + 'Gi';
      }
    }

    return notebook;
  }

  // Set the tooltip text based on form's validity
  setTooltipText(form: FormGroup): string {
    let text: string;
    if (!form.controls.valid) {
      text = $localize`The form contains invalid fields`;
    }
    return text;
  }

  onSubmit() {
    const configInfo: SnackBarConfig = {
      data: {
        msg: $localize`Editing Notebook...`,
        snackType: SnackType.Info,
      },
    };
    this.snackbar.open(configInfo);

    // Format form data
    const notebook = this.getSubmitNotebook();

    // Submit to backend
    this.backend.editNotebook(notebook).subscribe(() => {
      this.snackbar.close();
      const configSuccess: SnackBarConfig = {
        data: {
          msg: $localize`Notebook edited successfully.`,
          snackType: SnackType.Success,
        },
      };
      this.snackbar.open(configSuccess);
      this.goToNotebooks();
    });
  }

  onCancel() {
    this.goToNotebooks();
  }

  goToNotebooks() {
    this.router.navigate(['/']);
  }
}
