import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Config, NotebookRawObject } from 'src/app/types';
import { createFormGroupFromVolume } from 'src/app/shared/utils/volumes';

export function getEditFormDefaults(): FormGroup {
  const fb = new FormBuilder();

  return fb.group({
    cpu: [0, [Validators.required]],
    cpuLimit: ['', []],
    memory: [0, [Validators.required]],
    memoryLimit: ['', []],
    datavols: fb.array([]),
  });
}

export function calculateLimits(
  requests: number | string,
  factor: number | string,
): string | null {
  const limit = configSizeToNumber(requests) * configSizeToNumber(factor);

  if (isNaN(limit)) {
    return null;
  }

  return limit.toFixed(1);
}

export function initCpuFormControls(formCtrl: FormGroup, config: Config) {
  const cpu = Number(config.cpu.value);
  
  if (!isNaN(cpu)) {
    formCtrl.controls.cpu.setValue(cpu);
  }

  if (config.cpu.readOnly) {
    formCtrl.controls.cpu.disable();
    formCtrl.controls.cpuLimit.disable();
  }

  const cpuLimit = Number(config.cpu.limitValue);
  formCtrl.controls.cpuLimit.setValue(
    //AAW
    //calculateLimits(cpu, config.cpu.limitFactor),
    cpuLimit,
  );
}

export function initMemoryFormControls(formCtrl: FormGroup, config: Config) {
  const memory = configSizeToNumber(config.memory.value);
  if (!isNaN(memory)) {
    formCtrl.controls.memory.setValue(memory);
  }

  if (config.memory.readOnly) {
    formCtrl.controls.memory.disable();
    formCtrl.controls.memoryLimit.disable();
  }

  const memoryLimit = configSizeToNumber(config.memory.limitValue);
  formCtrl.controls.memoryLimit.setValue(
    //AAW
    //calculateLimits(memory, config.memory.limitFactor),
    memoryLimit,
  );
}

export function initDataVolumeControl(form: FormGroup, config: Config) {
  const datavols = config.dataVolumes.value;

  const datavolsArray = new FormArray([]);
  form.setControl('datavols', datavolsArray);

  for (const vol of datavols) {
    let volControl = createFormGroupFromVolume(vol);

    // Marks the mount path as dirty to prevent the value being overriden by the default mount path
    volControl.get("mount").markAsDirty();

    datavolsArray.push(volControl);
  }
}

export function configSizeToNumber(size: string | number): number {
  if (size == null) {
    return NaN;
  }

  if (typeof size === 'number') {
    return size;
  }

  return Number(size.replace('Gi', ''));
}

export function initEditFormControls(
  formCtrl: FormGroup,
  config: Config
) {
  initCpuFormControls(formCtrl, config);

  initMemoryFormControls(formCtrl, config);

  // Data volumes
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
    config.dataVolumes.value = [];
    if (cn.volumeMounts) {
      for (const volMount of cn.volumeMounts){
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