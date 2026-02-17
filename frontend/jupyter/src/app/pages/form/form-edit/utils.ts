import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Config, NotebookRawObject } from 'src/app/types';
import { calculateLimits, initCpuFormControls, initDataVolumeControl, initMemoryFormControls, initWorkspaceVolumeControl } from '../form-new/utils';

export function getEditFormDefaults(): FormGroup {
  const fb = new FormBuilder();

  return fb.group({
    cpu: [0, [Validators.required]],
    cpuLimit: ['', []],
    memory: [0, [Validators.required]],
    memoryLimit: ['', []],
    workspace: fb.group({
      mount: ['/home/jovyan', [Validators.required]],
    }),
    datavols: fb.array([]),
  });
}

export function initEditFormControls(
  formCtrl: FormGroup,
  config: Config
) {
  initCpuFormControls(formCtrl, config);

  initMemoryFormControls(formCtrl, config);

  initWorkspaceVolumeControl(formCtrl, config);

  initDataVolumeControl(formCtrl, config);
}

export function setConfigForNotebook(notebook: NotebookRawObject, config: Config) {
  // Return if notebook has no containers
  if (!notebook?.spec?.template?.spec?.containers) {
    return;
  }

  for (const cn of notebook.spec.template.spec.containers) {
    // Skip container if it's not the main notebook container
    if (cn.name !== notebook.metadata.name) {
      continue;
    }

    // Set the resources config from the notebook using the formatted output
    config.cpu.value = notebook.formatted_resources.cpu
    config.cpu.limitValue = notebook.formatted_resources.cpuLimit
    config.memory.value = notebook.formatted_resources.memory
    config.memory.limitValue = notebook.formatted_resources.memoryLimit

    // Set the volumes config from the notebook
    config.workspaceVolume.value = {mount: "/home/jovyan"};
    config.dataVolumes.value = [];
    if (cn.volumeMounts) {
      for (const volMount of cn.volumeMounts){
        if(!config.workspaceVolume.value.existingSource && volMount.mountPath === "/home/jovyan"){
          config.workspaceVolume.value.existingSource = {
            name: volMount.name,
            persistentVolumeClaim:{
              readOnly: false,
              claimName: volMount.name,
            },
          };
        } else {
          config.dataVolumes.value.push({
            mount: volMount.mountPath,
            existingSource:{
              name: volMount.name,
              persistentVolumeClaim:{
                readOnly: false,
                claimName: volMount.name,
              }
            },
          });
        }
      }
    }
  }
}