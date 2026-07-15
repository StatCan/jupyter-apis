import { DialogConfig, FormDialogConfig } from 'kubeflow';

// --- Configs for the Confirm Dialogs ---
export function getDeleteDialogConfig(name: string): DialogConfig {
  return {
    title: $localize`Are you sure you want to delete this notebook server? ${name}`,
    warning: $localize`Warning:`,
    message: $localize`Your data might be lost if the notebook server
                       is not backed by persistent storage`,
    accept: $localize`DELETE`,
    confirmColor: 'warn',
    cancel: $localize`CANCEL`,
    error: '',
    applying: $localize`DELETING`,
    width: '600px',
  };
}

export function getStopDialogConfig(name: string): DialogConfig {
  return {
    title: $localize`Are you sure you want to stop this notebook server? ${name}`,
    warning: $localize`Warning:`,
    message: $localize`Your data might be lost if the notebook server
                       is not backed by persistent storage`,
    accept: $localize`STOP`,
    confirmColor: 'primary',
    cancel: $localize`CANCEL`,
    error: '',
    applying: $localize`STOPPING`,
    width: '600px',
  };
}

export function getDeleteVolumeDialogConfig(name: string): DialogConfig {
    return {
      title: $localize`Are you sure you want to delete this volume? ${name}`,
      message: $localize`Warning: All data in this volume will be lost.`,
      accept: $localize`DELETE`,
      confirmColor: 'warn',
      cancel: $localize`CANCEL`,
      error: '',
      applying: $localize`DELETING`,
      width: '600px',
    };
  }

// --- Configs for the Form Dialogs ---
export function getExpandVolumeDialogConfig(name: string, size: string): FormDialogConfig {
    return {
      title: $localize`Increase size of volume ${name}`,
      message: $localize`Select the new size for this volume. To note that you can only expand the volume. You cannot shrink it.`,
      accept: $localize`Submit`,
      applying: $localize`INCREASING SIZE`,
      confirmColor: 'primary',
      cancel: $localize`Cancel`,
      error: '',
      width: '600px',
      oldSize: size,
    };
  }
