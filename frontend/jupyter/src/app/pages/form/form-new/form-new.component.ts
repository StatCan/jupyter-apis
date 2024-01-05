import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  AfterContentChecked,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Config, NotebookFormObject } from 'src/app/types';
import { Subscription } from 'rxjs';
import { NamespaceService, SnackBarService, SnackType } from 'kubeflow';
import { Router } from '@angular/router';
import { getFormDefaults, initFormControls } from './utils';
import { JWABackendService } from 'src/app/services/backend.service';
import { V1Namespace } from '@kubernetes/client-node';

@Component({
  selector: 'app-form-new',
  templateUrl: './form-new.component.html',
  styleUrls: ['./form-new.component.scss'],
})
export class FormNewComponent
  implements OnInit, OnDestroy, AfterContentChecked
{
  currNamespace = '';
  formCtrl: UntypedFormGroup;
  config: Config;

  defaultStorageclass = false;

  subscriptions = new Subscription();

  readonlySpecs: boolean;

  nsMetadata: V1Namespace;

  existingNotebooks: Set<string> = new Set<string>();
  mountedVolumes: Set<string> = new Set<string>();

  constructor(
    public namespaceService: NamespaceService,
    public backend: JWABackendService,
    public router: Router,
    public popup: SnackBarService,
    public cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Initialize the form control
    this.formCtrl = this.getFormDefaults();

    // Update the form Values from the default ones
    this.backend.getConfig().subscribe(config => {
      if (Object.keys(config).length === 0) {
        // Don't fire on empty config
        return;
      }

      this.config = config;
      this.initFormControls(this.formCtrl, config);
    });

    // Keep track of the selected namespace
    this.subscriptions.add(
      //AAW: use getSelectedNamespace instead of getSelectedNamespace2 to only return a string
      this.namespaceService.getSelectedNamespace().subscribe(namespace => {
        if (Array.isArray(namespace)) {
          this.goToNotebooks();
        } else {
          if (this.currNamespace && this.currNamespace !== namespace) {
            this.router.navigate(['/']);
          }
          this.currNamespace = namespace;
          this.formCtrl.controls.namespace.setValue(this.currNamespace);
        }

        this.backend.getNSMetadata(namespace).subscribe(nsMetadata => {
          this.nsMetadata = nsMetadata;
        });

        this.backend.getNotebooks(namespace).subscribe(notebooks => {
          this.existingNotebooks.clear();
          notebooks.map(nb => this.existingNotebooks.add(nb.name));

          this.mountedVolumes.clear();
          notebooks.map(nb =>
            nb.volumes.map(v => {
              this.mountedVolumes.add(v);
            }),
          );
        });
      }),
    );

    // Check if a default StorageClass is set
    this.backend.getDefaultStorageClass().subscribe(defaultClass => {
      if (defaultClass.length === 0) {
        this.defaultStorageclass = false;
        this.popup.open(
          $localize`No default Storage Class is set. Can't create new Disks for the new Notebook. Please use an Existing Disk.`,
          SnackType.Warning,
          0,
        );
      } else {
        this.defaultStorageclass = true;
      }
    });
  }

  ngOnDestroy() {
    // Unsubscriptions
    this.subscriptions.unsubscribe();
  }

  // Functions for handling the Form Group of the entire Form
  getFormDefaults() {
    return getFormDefaults();
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  initFormControls(formCtrl: UntypedFormGroup, config: Config) {
    initFormControls(formCtrl, config);
  }

  // Form Actions
  getSubmitNotebook(): NotebookFormObject {
    const notebookCopy = this.formCtrl.value as NotebookFormObject;
    const notebook = JSON.parse(JSON.stringify(notebookCopy));

    // Use the custom image instead
    if (notebook.customImageCheck) {
      notebook.image = notebook.customImage;
    } else if (notebook.serverType === 'group-one') {
      // Set notebook image from imageGroupOne
      notebook.image = notebook.imageGroupOne;
    } else if (notebook.serverType === 'group-two') {
      // Set notebook image from imageGroupTwo
      notebook.image = notebook.imageGroupTwo;
    } else if (notebook.serverType === 'group-three') {
      // Set notebook image from imageGroupThree
      notebook.image = notebook.imageGroupThree;
    }

    // Set serverType for custom image
    if (notebook.customImageCheck) {
      if (notebook.image.match(/\/rstudio:/)) {
        notebook.serverType = 'group-one';
      } else if (notebook.image.match(/\/remote-desktop:/)) {
        notebook.serverType = 'group-two';
      } else if (notebook.image.match(/\/sas:/)) {
        notebook.serverType = 'group-three';
      } else {
        notebook.serverType = 'jupyter';
      }
    }

    // Remove unnecessary images from the request sent to the backend
    delete notebook.imageGroupOne;
    delete notebook.imageGroupTwo;
    delete notebook.imageGroupThree;

    // Ensure CPU input is a string
    if (typeof notebook.cpu === 'number') {
      notebook.cpu = notebook.cpu.toString();
    }

    // Ensure GPU input is a string
    if (notebook.gpus && typeof notebook.gpus.num === 'number') {
      notebook.gpus.num = notebook.gpus.num.toString();
    }

    // Remove cpuLimit from request if null
    if (notebook.cpuLimit == null) {
      delete notebook.cpuLimit;
      // Ensure CPU Limit input is a string
    } else if (typeof notebook.cpuLimit === 'number') {
      notebook.cpuLimit = notebook.cpuLimit.toString();
    }

    // Remove memoryLimit from request if null
    if (notebook.memoryLimit == null) {
      delete notebook.memoryLimit;
      // Add Gi to memoryLimit
    } else if (notebook.memoryLimit) {
      notebook.memoryLimit = notebook.memoryLimit.toString() + 'Gi';
    }

    // Add Gi to all sizes
    if (notebook.memory) {
      notebook.memory = notebook.memory.toString() + 'Gi';
    }

    for (const vol of notebook.datavols) {
      if (vol.size) {
        vol.size = vol.size + 'Gi';
      }
    }

    return notebook;
  }

  // Set the tooltip text based on form's validity
  setTooltipText(form: UntypedFormGroup): string {
    let text: string;
    if (!form.get('name').valid) {
      text = 'No value of the Notebook name was provided';
    } else if (!form.controls.valid) {
      text = 'The form contains invalid fields';
    }
    return text;
  }

  onSubmit() {
    this.popup.open('Submitting new Notebook...', SnackType.Info, 3000);

    const notebook = this.getSubmitNotebook();
    this.backend.createNotebook(notebook).subscribe(() => {
      this.popup.close();
      this.popup.open(
        'Notebook created successfully.',
        SnackType.Success,
        3000,
      );
      this.goToNotebooks();
    });
  }

  // Automatically set values of CPU and Memory if GPU is 1
  checkGPU(gpu: string) {
    if (gpu === 'none') {
      this.readonlySpecs = false;
      this.formCtrl.get('cpu').setValue(this.config?.cpu?.value);
      this.formCtrl.get('memory').setValue(this.config?.memory?.value);
      this.formCtrl.get('cpuLimit').setValue(this.config?.cpu?.limitValue);
      this.formCtrl
        .get('memoryLimit')
        .setValue(this.config?.memory?.limitValue);
    } else {
      this.readonlySpecs = true;
      this.formCtrl.get('cpu').setValue(this.config?.cpu?.gpuDefault);
      this.formCtrl.get('memory').setValue(this.config?.memory?.gpuDefault);
      this.formCtrl.get('cpuLimit').setValue(this.config?.cpu?.gpuDefault);
      this.formCtrl
        .get('memoryLimit')
        .setValue(this.config?.memory?.gpuDefault);
    }
  }

  onCancel() {
    this.goToNotebooks();
  }

  goToNotebooks() {
    this.router.navigate(['/']);
  }
}
