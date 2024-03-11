import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormArray,
} from '@angular/forms';
import { GPU, Config } from 'src/app/types';
import { createFormGroupFromVolume } from 'src/app/shared/utils/volumes';

export function getFormDefaults(): UntypedFormGroup {
  const fb = new UntypedFormBuilder();

  return fb.group({
    name: ['', [Validators.required]],
    namespace: ['', [Validators.required]],
    image: ['', [Validators.required]],
    imageGroupThree: ['', [Validators.required]],
    allowCustomImage: [true, []],
    imagePullPolicy: ['Always', [Validators.required]],
    customImage: ['', []],
    customImageCheck: [false, []],
    serverType: ['jupyter', [Validators.required]],
    cpu: [1, [Validators.required]],
    cpuLimit: ['', []],
    memory: [1, [Validators.required]],
    memoryLimit: ['', []],
    gpus: fb.group({
      vendor: ['', []],
      num: ['none', []], //AAW, choose no gpu by default
    }),
    workspace: fb.group({
      mount: ['/home/jovyan', [Validators.required]],
      newPvc: fb.group({
        metadata: fb.group({
          name: ['{notebook-name}-volume', [Validators.required]],
        }),
        spec: fb.group({
          accessModes: [['ReadWriteOnce']],
          resources: fb.group({
            requests: fb.group({
              storage: ['16Gi'], //AAW default storage set, don't remove
            }),
          }),
        }),
      }),
    }),
    affinityConfig: ['', []],
    tolerationGroup: ['', []],
    datavols: fb.array([]),
    shm: [true, []],
    configurations: [[], []],
    prob: [false, []],
    language: ['', [Validators.required]],
  });
}

export function updateGPUControl(formCtrl: UntypedFormGroup, gpuConf: any) {
  // If the backend didn't send the value, default to none
  if (gpuConf == null) {
    formCtrl.get('num').setValue('none');
    return;
  }

  // Set the values
  const gpu = gpuConf.value as GPU;
  formCtrl.get('num').setValue(gpu.num);
  formCtrl.get('vendor').setValue(gpu.vendor);

  // Don't allow the user to edit them if the admin does not allow it
  if (gpuConf.readOnly) {
    formCtrl.get('num').disable();
    formCtrl.get('vendor').disable();
  }
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

export function initCpuFormControls(
  formCtrl: UntypedFormGroup,
  config: Config,
) {
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

export function initMemoryFormControls(
  formCtrl: UntypedFormGroup,
  config: Config,
) {
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

export function initFormControls(formCtrl: UntypedFormGroup, config: Config) {
  initCpuFormControls(formCtrl, config);

  initMemoryFormControls(formCtrl, config);

  formCtrl.controls.image.setValue(config.image.value);

  if (config.imageGroupThree?.value) {
    formCtrl.controls.imageGroupThree.setValue(config.imageGroupThree.value);
  } else {
    formCtrl.controls.imageGroupThree.disable();
  }

  formCtrl.controls.imagePullPolicy.setValue(config.imagePullPolicy.value);
  if (config.imagePullPolicy.readOnly) {
    formCtrl.controls.imagePullPolicy.disable();
  }

  // Workspace volume
  initWorkspaceVolumeControl(formCtrl, config);

  // Data volumes
  initDataVolumeControl(formCtrl, config);

  // Affinity
  formCtrl.controls.affinityConfig.setValue(config.affinityConfig.value);
  if (config.affinityConfig.readOnly) {
    formCtrl.controls.affinityConfig.disable();
  }

  // Tolerations
  formCtrl.controls.tolerationGroup.setValue(config.tolerationGroup.value);
  if (config.tolerationGroup.readOnly) {
    formCtrl.controls.tolerationGroup.disable();
  }

  // GPUs
  updateGPUControl(formCtrl.get('gpus') as UntypedFormGroup, config.gpus);

  formCtrl.controls.shm.setValue(config.shm.value);
  if (config.shm.readOnly) {
    formCtrl.controls.shm.disable();
  }

  // PodDefaults / Configurations. Set the pre selected labels
  formCtrl.controls.configurations.setValue(config.configurations.value);
  if (config.configurations.readOnly) {
    formCtrl.controls.configurations.disable();
  }
}

export function initWorkspaceVolumeControl(
  form: UntypedFormGroup,
  config: Config,
) {
  const workspace = config.workspaceVolume.value;
  if (!workspace) {
    form.get('workspace').disable();
    return;
  }

  form.setControl('workspace', createFormGroupFromVolume(workspace));
}

export function initDataVolumeControl(form: UntypedFormGroup, config: Config) {
  const datavols = config.dataVolumes.value;

  const datavolsArray = new UntypedFormArray([]);
  form.setControl('datavols', datavolsArray);

  for (const vol of datavols) {
    datavolsArray.push(createFormGroupFromVolume(vol));
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
