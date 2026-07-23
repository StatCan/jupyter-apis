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

export function getConfirmExpandVolumeDialogConfig(
  name: string,
  size: number,
): DialogConfig {
  return {
    title: $localize`Are you sure you want to increase the size of ${name} to ${size}Gi?`,
    message: $localize`Warning: a larger volume is more costly to maintain`,
    accept: $localize`INCREASE`,
    confirmColor: 'primary',
    cancel: $localize`CANCEL`,
    error: '',
    applying: $localize`INCREASING`,
    width: '600px',
  };
}

// --- Configs for the Form Dialogs ---
export function getExpandVolumeDialogConfig(
  name: string,
  size: string,
): FormDialogConfig {
  return {
    title: $localize`Increase size of volume ${name}`,
    message: $localize`Select a new size for this volume. You can only increase the size, not reduce it.\n\nThis size increase will only be completed when this volume is attached to a running notebook server.`,
    boldMessage: $localize`To note: this change is non-reversable.`,
    accept: $localize`Submit`,
    applying: $localize`INCREASING`,
    confirmColor: 'primary',
    cancel: $localize`Cancel`,
    error: '',
    width: '600px',
    oldSize: size,
  };
}
