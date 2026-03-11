import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  AfterContentChecked,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Config, NotebookEditFormObject } from 'src/app/types';
import { Observable, Subscription } from 'rxjs';
import {
  ConfirmDialogService,
  DIALOG_RESP,
  DialogConfig,
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
import { getDiff, rdiffResult } from 'recursive-diff';
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

  initNotebook: NotebookEditFormObject;

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
    public confirmDialog: ConfirmDialogService,
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
            // saves the initial notebook values for comparing changes before submit
            this.initNotebook = this.getSubmitNotebook();

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

  getEditNotebookDialogConfig(
    name: string,
    simpleDiff: Set<String>,
  ): DialogConfig {
    return {
      title: $localize`Are you sure you want to edit notebook ${name}?`,
      content: $localize`These are the fields getting updated:`,
      editChanges: simpleDiff,
      warning: $localize`Warning:`,
      message: $localize`A running notebook server will automatically be restarted after being edited`,
      accept: $localize`EDIT`,
      confirmColor: 'primary',
      cancel: $localize`CANCEL`,
      error: '',
      applying: $localize`EDITING`,
      width: '600px',
    };
  }

  // returns a set of field names with detected changes
  formatDiff(delta: rdiffResult[]): Set<String> {
    let simpleDiff: Set<String> = new Set();

    for (const e of delta) {
      // since we currently hide cpuLimit and memoryLimit in the UI, let's also hide it from the diff report
      if (e.path[0] === 'cpuLimit' || e.path[0] === 'memoryLimit') {
        continue;
      }

      // format the field name that is being modified
      let fieldVal = '';
      switch (e.path[0]) {
        case 'cpu':
          fieldVal = $localize`CPU`;
          break;
        case 'memory':
          fieldVal = $localize`Memory`;
          break;
        case 'workspace':
          fieldVal = $localize`Workspace volume`;
          break;
        case 'datavols':
          fieldVal = $localize`Data volume(s)`;
          break;
        default:
          fieldVal = e.path.toString();
      }

      simpleDiff.add(fieldVal);
    }

    return simpleDiff;
  }

  editNotebook(
    namespace: string,
    name: string,
    notebook: NotebookEditFormObject,
    simpleDelta: Set<String>,
  ): Observable<string> {
    return new Observable(subscriber => {
      const editDialogConfig = this.getEditNotebookDialogConfig(
        name,
        simpleDelta,
      );

      const ref = this.confirmDialog.open(editDialogConfig);
      const editSub = ref.componentInstance.applying$.subscribe(applying => {
        if (!applying) {
          return;
        }

        // Submit to backend
        this.backend.editNotebook(notebook).subscribe({
          next: _ => {
            ref.close(DIALOG_RESP.ACCEPT);
            const object = `${namespace}/${name}`;
            const message = $localize`Edit request was sent.`;
            const config: SnackBarConfig = {
              data: {
                msg: `${object}: ${message}`,
                snackType: SnackType.Info,
              },
              duration: 5000,
            };
            this.snackbar.open(config);
          },
          error: err => {
            const errorMsg = $localize`Error ${err}`;
            editDialogConfig.error = errorMsg;
            ref.componentInstance.applying$.next(false);
            subscriber.next(`fail`);
          },
        });

        // Edit request has succeeded
        ref.afterClosed().subscribe(result => {
          editSub.unsubscribe();
          subscriber.next(result);
          subscriber.complete();
        });
      });
    });
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
    // Get delta of the notebook edit and format the output
    const delta = getDiff(this.initNotebook, notebook, true);
    const formattedDelta = this.formatDiff(delta);

    // dont call the backend if no changes are detected
    if (formattedDelta.size === 0) {
      this.goToNotebooks();
      return;
    }

    this.editNotebook(
      this.namespace,
      this.notebookName,
      notebook,
      formattedDelta,
    ).subscribe(result => {
      this.snackbar.close();
      if (result !== DIALOG_RESP.ACCEPT) {
        return;
      }

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
